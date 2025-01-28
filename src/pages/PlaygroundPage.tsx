// src/pages/PlaygroundPage.tsx

import React, { useState } from 'react';

// Importa tus componentes reales según tu estructura
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';
import Header from '../components/layout/Header';
import Chat from '../components/chat/Chat';
import CompareView from '../components/compare/CompareView';
import HistoryPanel from '../components/history/HistoryPanel';

import ViewCodeModal from '../components/modals/ViewCodeModal';
import { AddFunctionModal } from '../components/modals/AddFunctionModal';
import FunctionDefinitionModal from '../components/modals/FunctionDefinitionModal';

import { FiColumns } from 'react-icons/fi';
import { PageContainer, MainContent, SidebarToggleButton } from '../components/layout/layout.styles';

import { IMessageData } from '../components/chat/MessageBubble';

export interface IFunctionDef {
    name: string;
    jsonDefinition: string;
}

const PlaygroundPage: React.FC = () => {
    const [isViewCodeOpen, setIsViewCodeOpen] = useState(false);

    // Sidebar y compare
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCompareMode, setIsCompareMode] = useState(false);

    // Add/edit function
    const [isAddFunctionOpen, setIsAddFunctionOpen] = useState(false);
    const [editFnModalOpen, setEditFnModalOpen] = useState(false);
    const [fnToEdit, setFnToEdit] = useState<IFunctionDef | null>(null);

    // Lista de funciones
    const [functionsList, setFunctionsList] = useState<IFunctionDef[]>([]);

    // view function
    const [viewFnModalOpen, setViewFnModalOpen] = useState(false);
    const [fnToView, setFnToView] = useState<IFunctionDef | null>(null);

    // Chat principal (MAIN messages)
    const [chatMessages, setChatMessages] = useState<IMessageData[]>([]);

    // Compare
    const [leftMessages, setLeftMessages] = useState<IMessageData[]>([]);
    const [rightMessages, setRightMessages] = useState<IMessageData[]>([]);

    // Config principal
    const [tempValue, setTempValue] = useState(1.0);
    const [maxTokens, setMaxTokens] = useState(2048);
    const [topP, setTopP] = useState(1.0);
    const [freqPenalty, setFreqPenalty] = useState(0);
    const [presPenalty, setPresPenalty] = useState(0);

    // History
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyRecords, setHistoryRecords] = useState<any[]>([]);

    // Toggle sidebar
    const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Agregar función
    const handleAddFunction = (fn: IFunctionDef) => {
        setFunctionsList(prev => [...prev, fn]);
    };
    const handleUpdateFunction = (updated: IFunctionDef) => {
        setFunctionsList(prev =>
            prev.map(f => (f.name === updated.name ? updated : f))
        );
    };
    const openEditModal = (fn: IFunctionDef) => {
        setFnToEdit(fn);
        setEditFnModalOpen(true);
    };

    // Ver definición de función
    const handleOpenViewFunction = (fn: IFunctionDef) => {
        setFnToView(fn);
        setViewFnModalOpen(true);
    };
    const handleCloseViewFunction = () => {
        setViewFnModalOpen(false);
        setFnToView(null);
    };

    // Limpiar chat
    const handleClear = () => {
        setChatMessages([]);
    };

    // Toggle history
    const handleToggleHistory = () => {
        setIsHistoryOpen(!isHistoryOpen);
    };

    // Al togglear el modo compare, copiamos el chat principal a ambos paneles
    const handleToggleCompare = () => {
        if (!isCompareMode) {
            // Copiar mensajes actuales a ambos paneles
            setLeftMessages(chatMessages);
            setRightMessages(chatMessages);
        }
        setIsCompareMode(!isCompareMode);
    };

    return (
        <PageContainer>
            <Sidebar isOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />

            {/* Botón flotante si el sidebar está cerrado */}
            {!isSidebarOpen && (
                <SidebarToggleButton onClick={handleToggleSidebar}>
                    <FiColumns />
                </SidebarToggleButton>
            )}

            <MainContent isCompareMode={isCompareMode}>
                <Header
                    onClickViewCode={() => setIsViewCodeOpen(true)}
                    onToggleCompare={handleToggleCompare}
                    onClear={handleClear}
                    onToggleHistory={handleToggleHistory}
                />

                {!isCompareMode ? (
                    <Chat
                        functionsList={functionsList}
                        messages={chatMessages}
                        setMessages={setChatMessages}
                        onAddHistory={(m) => setHistoryRecords(prev => [...prev, m])}
                    />
                ) : (
                    // AQUI le pasamos TODO a CompareView, incluyendo el chat principal (mainMessages)
                    <CompareView
                        leftMessages={leftMessages}
                        setLeftMessages={setLeftMessages}
                        rightMessages={rightMessages}
                        setRightMessages={setRightMessages}

                        // Props para sincronizar el chat principal
                        mainMessages={chatMessages}
                        setMainMessages={setChatMessages}
                    />
                )}
            </MainContent>

            {/* Si no estamos en compare ni en history, se muestra el RightPanel */}
            {!isCompareMode && !isHistoryOpen && (
                <RightPanel
                    isCompareMode={false}
                    onOpenAddFunctionModal={() => setIsAddFunctionOpen(true)}
                    functionsList={functionsList}
                    onOpenViewFunction={openEditModal}
                    tempValue={tempValue} setTempValue={setTempValue}
                    maxTokens={maxTokens} setMaxTokens={setMaxTokens}
                    topP={topP} setTopP={setTopP}
                    freqPenalty={freqPenalty} setFreqPenalty={setFreqPenalty}
                    presPenalty={presPenalty} setPresPenalty={setPresPenalty}
                />
            )}

            {/* History panel */}
            {isHistoryOpen && (
                <HistoryPanel
                    historyRecords={historyRecords.map((h,i)=>({
                        id: i,
                        role: h.role,
                        content: h.content,
                        timestamp: new Date()
                    }))}
                    onClosePanel={() => setIsHistoryOpen(false)}
                    onClearHistory={() => setHistoryRecords([])}
                    onDownloadHistory={() => {}}
                    fullMessages={chatMessages}
                    setFilteredMessages={setChatMessages}
                />
            )}

            {/* View Code modal */}
            {isViewCodeOpen && (
                <ViewCodeModal
                    onClose={() => setIsViewCodeOpen(false)}
                    messages={chatMessages}
                    tempValue={tempValue}
                    maxTokens={maxTokens}
                    topP={topP}
                    freqPenalty={freqPenalty}
                    presPenalty={presPenalty}
                />
            )}

            {/* Add function */}
            {isAddFunctionOpen && (
                <AddFunctionModal
                    mode="add"
                    onClose={() => setIsAddFunctionOpen(false)}
                    onAddFunction={handleAddFunction}
                />
            )}
            {editFnModalOpen && fnToEdit && (
                <AddFunctionModal
                    mode="edit"
                    initialFn={fnToEdit}
                    onClose={() => {
                        setEditFnModalOpen(false);
                        setFnToEdit(null);
                    }}
                    onAddFunction={handleUpdateFunction}
                />
            )}
            {viewFnModalOpen && fnToView && (
                <FunctionDefinitionModal
                    fnDef={fnToView}
                    onClose={handleCloseViewFunction}
                />
            )}
        </PageContainer>
    );
};

export default PlaygroundPage;
