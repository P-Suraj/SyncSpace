import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

const Editor = forwardRef(({ roomId, onUsersChange, language, onLanguageChange }, ref) => {
    const editorRef = useRef(null);
    const ydocRef = useRef(null);
    const providerRef = useRef(null);
    const bindingRef = useRef(null);
    const languageRef = useRef(language);

    // Keep the local ref updated so Yjs observer avoids cyclical updates
    useEffect(() => {
        languageRef.current = language;
        if (ydocRef.current) {
            const roomState = ydocRef.current.getMap('roomState');
            if (roomState.get('language') !== language) {
                roomState.set('language', language);
            }
        }
    }, [language]);

    // Expose the editor's text value to the parent App for code execution
    useImperativeHandle(ref, () => ({
        getValue: () => editorRef.current ? editorRef.current.getValue() : ""
    }));

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // Ensure clean state: Y.Doc separates Y.Map and Y.Text independently
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        const provider = new WebsocketProvider(
            'ws://localhost:3000',
            roomId,
            ydoc
        );
        providerRef.current = provider;

        const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const userName = `Dev-${Math.floor(Math.random() * 1000)}`;
        provider.awareness.setLocalStateField('user', { name: userName, color: userColor });

        provider.awareness.on('change', () => {
            const states = Array.from(provider.awareness.getStates().values());
            const activeUsers = states.map(state => state.user).filter(Boolean);
            if (onUsersChange) onUsersChange(activeUsers);
        });

        // Setup Language Sync (Uses Y.Map, no collision with Y.Text)
        const roomState = ydoc.getMap('roomState');
        roomState.observe(() => {
            const syncedLanguage = roomState.get('language');
            if (syncedLanguage && syncedLanguage !== languageRef.current) {
                onLanguageChange(syncedLanguage);
            }
        });

        if (!roomState.has('language')) {
            roomState.set('language', language);
        }

        // Setup Document Sync
        const ytext = ydoc.getText('monaco');

        const binding = new MonacoBinding(
            ytext,
            editorRef.current.getModel(),
            new Set([editorRef.current]),
            provider.awareness
        );
        bindingRef.current = binding;
    };

    useEffect(() => {
        return () => {
            if (bindingRef.current) bindingRef.current.destroy();
            if (providerRef.current) providerRef.current.disconnect();
            if (ydocRef.current) ydocRef.current.destroy();
        };
    }, []);

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MonacoEditor
                height="100%"
                language={language}
                defaultValue="// Welcome to SyncSpace - Collaborative IDE"
                theme="vs-dark"
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: "on",
                    padding: { top: 16 },
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
});

export default React.memo(Editor);
