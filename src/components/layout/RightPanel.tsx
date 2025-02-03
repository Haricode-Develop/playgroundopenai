// src/components/layout/RightPanel.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiBox, FiPlus } from 'react-icons/fi';
import { IFunctionDef } from '../../pages/PlaygroundPage';
import { listModels } from '../../services/playgroundApi';

interface RightPanelProps {
    isCompareMode: boolean;
    onOpenAddFunctionModal: () => void;
    functionsList: IFunctionDef[];
    onOpenViewFunction: (fn: IFunctionDef) => void;

    // Aquí agregamos:
    selectedModel: string;
    setSelectedModel: (val: string) => void;

    // Parámetros de config
    tempValue: number; setTempValue: (val: number) => void;
    maxTokens: number; setMaxTokens: (val: number) => void;
    topP: number; setTopP: (val: number) => void;
    freqPenalty: number; setFreqPenalty: (val: number) => void;
    presPenalty: number; setPresPenalty: (val: number) => void;
}

const RightPanelContainer = styled.div`
    width: 300px;
    background-color: #1f1f1f;
    border-left: 1px solid #333;
    display: flex;
    flex-direction: column;
    padding: 1rem;
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #fff;
    font-size: 1rem;

    svg {
        font-size: 1.2rem;
    }
`;

const PanelSection = styled.div`
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #333;
`;

const SectionTitle = styled.h3`
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    color: #fff;
`;

const RoundedSelect = styled.select`
    width: 100%;
    background-color: #2f2f2f;
    border: 1px solid #444;
    border-radius: 8px;
    color: #fff;
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
    outline: none;
    margin-bottom: 0.75rem;
    appearance: none;
    transition: border var(--transition-fast);

    &:focus {
        border-color: #666;
    }
`;

const FunctionsListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 0.5rem;
`;

const FunctionItem = styled.div`
    background-color: #2f2f2f;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
    color: #ccc;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    &:hover {
        background-color: #3a3a3a;
    }
    svg {
        font-size: 1rem;
    }
`;

const FunctionName = styled.span`
    font-weight: 500;
`;

const AddButton = styled.button`
    background-color: #3a3a3a;
    border: none;
    color: #fff;
    font-size: 0.85rem;
    border-radius: 6px;
    padding: 0.3rem 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
        background-color: #4a4a4a;
    }

    svg {
        font-size: 1rem;
    }
`;

const SaveButtonSection = styled.div`
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid #333;
`;

const SaveButton = styled.button`
    width: 100%;
    background-color: #3a3a3a;
    border: none;
    color: #fff;
    border-radius: 6px;
    padding: 0.6rem;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
        background-color: #4a4a4a;
    }
`;

const RightPanel: React.FC<RightPanelProps> = ({
                                                   isCompareMode,
                                                   onOpenAddFunctionModal,
                                                   functionsList,
                                                   onOpenViewFunction,

                                                   selectedModel,
                                                   setSelectedModel,

                                                   tempValue, setTempValue,
                                                   maxTokens, setMaxTokens,
                                                   topP, setTopP,
                                                   freqPenalty, setFreqPenalty,
                                                   presPenalty, setPresPenalty
                                               }) => {
    const [modelList, setModelList] = useState<{id: string}[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [errorModels, setErrorModels] = useState<string | null>(null);

    useEffect(() => {
        async function fetchModels() {
            try {
                setLoadingModels(true);
                setErrorModels(null);
                const data = await listModels();
                // data.data => array de {id:'...', object:'model'}
                setModelList(data.data);
            } catch (err: any) {
                setErrorModels(err.message);
            } finally {
                setLoadingModels(false);
            }
        }
        fetchModels();
    }, []);

    return (
        <RightPanelContainer>
            <TitleRow>
                <FiBox />
                Your Presets
            </TitleRow>

            <PanelSection>
                <SectionTitle>Model</SectionTitle>
                {loadingModels && <div style={{ color: '#aaa' }}>Cargando modelos...</div>}
                {errorModels && <div style={{ color: 'red' }}>{errorModels}</div>}
                {!loadingModels && !errorModels && (
                    <RoundedSelect
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                    >
                        {modelList.map((m) => (
                            <option key={m.id} value={m.id}>{m.id}</option>
                        ))}
                    </RoundedSelect>
                )}
            </PanelSection>

            <PanelSection>
                <SectionTitle>Response format</SectionTitle>
                <RoundedSelect>
                    <option>text</option>
                    <option>json</option>
                    <option>json_object</option>
                </RoundedSelect>
            </PanelSection>

            <PanelSection>
                <SectionTitle>Functions</SectionTitle>
                <FunctionsListContainer>
                    {functionsList.length < 1 ? (
                        <i style={{ color: '#ccc', fontSize: '0.9rem' }}>No functions</i>
                    ) : (
                        functionsList.map((fn, idx) => (
                            <FunctionItem
                                key={idx}
                                title="Click to edit function"
                                onClick={() => onOpenViewFunction(fn)}
                            >
                                <FiBox />
                                <FunctionName>{fn.name}</FunctionName>
                            </FunctionItem>
                        ))
                    )}
                </FunctionsListContainer>

                <AddButton onClick={onOpenAddFunctionModal}>
                    <FiPlus />
                    Add
                </AddButton>
            </PanelSection>

            <PanelSection>
                <SectionTitle>Model configuration</SectionTitle>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbb', fontSize: '0.85rem' }}>
                    <label>Temperature</label>
                    <span>{tempValue.toFixed(2)}</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.01}
                    value={tempValue}
                    onChange={e => setTempValue(parseFloat(e.target.value))}
                    style={{ width: '100%', margin: '0.5rem 0' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbb', fontSize: '0.85rem' }}>
                    <label>Max tokens</label>
                    <span>{maxTokens}</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={32000}
                    step={1}
                    value={maxTokens}
                    onChange={e => setMaxTokens(parseInt(e.target.value, 10))}
                    style={{ width: '100%', margin: '0.5rem 0' }}
                />

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#fff', marginBottom: '0.25rem' }}>Stop sequences</label>
                    <input
                        type="text"
                        placeholder="Enter sequences..."
                        style={{
                            width: '100%',
                            backgroundColor: '#2f2f2f',
                            border: '1px solid #444',
                            borderRadius: '8px',
                            color: '#fff',
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.9rem'
                        }}
                    />
                    <small style={{ color: '#666' }}>Enter sequence and press Tab</small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbb', fontSize: '0.85rem' }}>
                    <label>Top P</label>
                    <span>{topP.toFixed(2)}</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={topP}
                    onChange={e => setTopP(parseFloat(e.target.value))}
                    style={{ width: '100%', margin: '0.5rem 0' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbb', fontSize: '0.85rem' }}>
                    <label>Frequency penalty</label>
                    <span>{freqPenalty.toFixed(2)}</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.01}
                    value={freqPenalty}
                    onChange={e => setFreqPenalty(parseFloat(e.target.value))}
                    style={{ width: '100%', margin: '0.5rem 0' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#bbb', fontSize: '0.85rem' }}>
                    <label>Presence penalty</label>
                    <span>{presPenalty.toFixed(2)}</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.01}
                    value={presPenalty}
                    onChange={e => setPresPenalty(parseFloat(e.target.value))}
                    style={{ width: '100%', margin: '0.5rem 0' }}
                />
            </PanelSection>

            <SaveButtonSection>
                <SaveButton>Save as preset</SaveButton>
            </SaveButtonSection>
        </RightPanelContainer>
    );
};

export default RightPanel;
