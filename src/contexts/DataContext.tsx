/**
 * Data Context
 * ====================
 * Manages file data state across the application.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api, DataFile } from '../services/api';

interface DataState {
  currentFile: DataFile | null;
  files: DataFile[];
  isLoading: boolean;
  error: string | null;
}

interface DataContextType extends DataState {
  uploadFile: (file: File) => Promise<DataFile>;
  loadFiles: () => Promise<void>;
  selectFile: (fileId: string | number) => void;
  deleteFile: (fileId: string | number) => Promise<void>;
  refreshCurrentFile: () => Promise<void>;
  clearError: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DataState>({
    currentFile: null,
    files: [],
    isLoading: false,
    error: null,
  });

  const uploadFile = useCallback(async (file: File): Promise<DataFile> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const uploadedFile = await api.uploadFile(file);

      setState((prev) => ({
        ...prev,
        files: [uploadedFile, ...prev.files],
        currentFile: uploadedFile,
        isLoading: false,
      }));

      return uploadedFile;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Upload failed',
      }));
      throw error;
    }
  }, []);

  const loadFiles = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const fileList = await api.listFiles(1, 100);

      setState((prev) => ({
        ...prev,
        files: fileList.files,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load files',
      }));
    }
  }, []);

  const selectFile = useCallback((fileId: string | number) => {
    setState((prev) => {
      const file = prev.files.find((f) => f.id === fileId);
      return { ...prev, currentFile: file || null };
    });
  }, []);

  const deleteFile = useCallback(async (fileId: string | number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await api.deleteFile(Number(fileId));

      setState((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f.id !== fileId),
        currentFile: prev.currentFile?.id === fileId ? null : prev.currentFile,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Delete failed',
      }));
      throw error;
    }
  }, []);

  const refreshCurrentFile = useCallback(async () => {
    if (!state.currentFile) return;

    try {
      const refreshedFile = await api.getFile(state.currentFile.id);
      setState((prev) => ({
        ...prev,
        currentFile: refreshedFile,
        files: prev.files.map((f) => (f.id === refreshedFile.id ? refreshedFile : f)),
      }));
    } catch (error) {
      // Ignore refresh errors
    }
  }, [state.currentFile]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: DataContextType = {
    ...state,
    uploadFile,
    loadFiles,
    selectFile,
    deleteFile,
    refreshCurrentFile,
    clearError,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
