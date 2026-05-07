'use client';

import { createContext, useContext, useState } from 'react';
import { DEFAULT_EDITOR_PREFERENCES, type EditorPreferences } from '@/lib/editor-preferences';

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  setPreferences: (prefs: EditorPreferences) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue>({
  preferences: DEFAULT_EDITOR_PREFERENCES,
  setPreferences: () => {},
});

export function EditorPreferencesProvider({
  children,
  initialPreferences,
}: {
  children: React.ReactNode;
  initialPreferences: EditorPreferences;
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>(initialPreferences);

  return (
    <EditorPreferencesContext value={{ preferences, setPreferences }}>
      {children}
    </EditorPreferencesContext>
  );
}

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext);
}
