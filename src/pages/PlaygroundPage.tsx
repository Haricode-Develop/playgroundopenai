import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import RightPanel from '../components/layout/RightPanel';
import {
    PageContainer,
    MainContent,
    SidebarToggleButton
} from '../components/layout/layout.styles';
import Header from '../components/layout/Header';
import Chat from '../components/chat/Chat';
import AddFunctionModal from '../components/modals/AddFunctionModal';
import ViewCodeModal from '../components/modals/ViewCodeModal';
import CompareView from '../components/compare/CompareView';
import { FiColumns } from 'react-icons/fi';
import FunctionDefinitionModal from '../components/modals/FunctionDefinitionModal';

export interface IFunctionDef {
    name: string;         // nombre extraído del JSON
    jsonDefinition: string; // contenido JSON completo
}

const PlaygroundPage: React.FC = () => {
    const [isViewCodeOpen, setIsViewCodeOpen] = useState(false);

    // Maneja si el sidebar está abierto o no
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Controla si estamos en Compare Mode
    const [isCompareMode, setIsCompareMode] = useState(false);

    // Modal "Add function"
    const [isAddFunctionOpen, setIsAddFunctionOpen] = useState(false);

    // Lista de funciones
    const [functionsList, setFunctionsList] = useState<IFunctionDef[]>([]);

    // Modal para ver contenido de 1 función
    const [viewFnModalOpen, setViewFnModalOpen] = useState(false);
    const [fnToView, setFnToView] = useState<IFunctionDef | null>(null);

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Añadir nueva función
    const handleAddFunction = (fn: IFunctionDef) => {
        setFunctionsList((prev) => [...prev, fn]);
    };

    // Abrir modal de ver función
    const handleOpenViewFunction = (fn: IFunctionDef) => {
        setFnToView(fn);
        setViewFnModalOpen(true);
    };

    const handleCloseViewFunction = () => {
        setViewFnModalOpen(false);
        setFnToView(null);
    };

    return (
        <PageContainer>
            <Sidebar isOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />

            {!isSidebarOpen && (
                <SidebarToggleButton onClick={handleToggleSidebar}>
                    <FiColumns />
                </SidebarToggleButton>
            )}

            <MainContent isCompareMode={isCompareMode}>
                <Header
                    onClickViewCode={() => setIsViewCodeOpen(true)}
                    onToggleCompare={() => setIsCompareMode(!isCompareMode)}
                    onClear={() => {/* implementa si gustas */}}
                />

                {!isCompareMode ? (
                    <Chat
                        functionsList={functionsList}
                        onOpenViewFunction={handleOpenViewFunction}
                    />
                ) : (
                    <CompareView />
                )}
            </MainContent>

            <RightPanel
                isCompareMode={isCompareMode}
                onOpenAddFunctionModal={() => setIsAddFunctionOpen(true)}
                functionsList={functionsList}
                onOpenViewFunction={handleOpenViewFunction}
            />

            {/* Modales */}
            {isAddFunctionOpen && (
                <AddFunctionModal
                    onClose={() => setIsAddFunctionOpen(false)}
                    onAddFunction={handleAddFunction}
                />
            )}

            {isViewCodeOpen && (
                <ViewCodeModal onClose={() => setIsViewCodeOpen(false)} />
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
