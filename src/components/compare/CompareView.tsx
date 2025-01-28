// src/components/compare/CompareView.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiZap, FiArrowUp, FiArrowDown, FiClipboard, FiMoreHorizontal, FiSettings } from 'react-icons/fi';
import { IMessageData } from '../chat/MessageBubble';
import CompareColumnMenu from './CompareColumnMenu';
import CompareColumnConfig from './CompareColumnConfig';
import { IFunctionDef } from '../../pages/PlaygroundPage';
import CompareViewCodeModal from './CompareViewCodeModal';

/* ----------- Estilos (copiados de tu ejemplo) ----------- */

const CompareContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow: hidden;
    animation: fadeInCompare 0.4s ease forwards;
    @keyframes fadeInCompare {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const Column = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #333;
    &:last-child {
        border-right: none;
    }
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #2f2f2f;
    padding: 0.5rem;
    border-bottom: 1px solid #333;
`;

const RowLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ModelSelect = styled.select`
    background-color: #1f1f1f;
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
`;

const RowRight = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const MessagesArea = styled.div`
    flex: 1;
    padding: 1rem;
    color: #ccc;
    overflow-y: auto;
`;

const Bubble = styled.div`
    background-color: #3a3a3a;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    white-space: pre-wrap;
`;

const TimingBar = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
    background-color: #2f2f2f;
    border-top: 1px solid #333;
    div {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: #ccc;
        font-size: 0.8rem;
    }
`;

const Footer = styled.div`
    width: 100%;
    background-color: #2f2f2f;
    border-top: 1px solid #333;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const InputBox = styled.textarea`
    flex: 1;
    background-color: #1f1f1f;
    border: 1px solid #444;
    color: #fff;
    border-radius: 6px;
    padding: 0.5rem;
    min-height: 60px;
    resize: none;
    font-size: 0.9rem;
    &:focus {
        border-color: #666;
    }
`;

const RunButton = styled.button`
    background-color: #00a37a;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s ease;
    &:hover {
        background-color: #00b88c;
    }
`;

/* ------------------------------------------------- */

interface CompareProps {
    // Los 4 props originales
    leftMessages: IMessageData[];
    setLeftMessages: React.Dispatch<React.SetStateAction<IMessageData[]>>;
    rightMessages: IMessageData[];
    setRightMessages: React.Dispatch<React.SetStateAction<IMessageData[]>>;

    // NUEVO: El chat principal, para sincronizar
    mainMessages: IMessageData[];
    setMainMessages: React.Dispatch<React.SetStateAction<IMessageData[]>>;
}

const CompareView: React.FC<CompareProps> = ({
                                                 leftMessages, setLeftMessages,
                                                 rightMessages, setRightMessages,

                                                 // nuevo
                                                 mainMessages, setMainMessages
                                             }) => {

    // Un input para mandar mensajes a la vez a ambos (left, right).
    const [inputVal, setInputVal] = useState('');

    // Menús
    const [leftMenuAnchor, setLeftMenuAnchor] = useState<DOMRect|null>(null);
    const [rightMenuAnchor, setRightMenuAnchor] = useState<DOMRect|null>(null);

    // Config
    const [leftConfigAnchor, setLeftConfigAnchor] = useState<DOMRect|null>(null);
    const [rightConfigAnchor, setRightConfigAnchor] = useState<DOMRect|null>(null);

    // "View code" modals
    const [leftCodeOpen, setLeftCodeOpen] = useState(false);
    const [rightCodeOpen, setRightCodeOpen] = useState(false);

    // Ejemplos de "states" de config para left y right
    const [leftModel, setLeftModel] = useState('gpt-4o');
    const [leftResponseFmt, setLeftResponseFmt] = useState('text');
    const [leftFunctions, setLeftFunctions] = useState<IFunctionDef[]>([]);
    const [leftTemp, setLeftTemp] = useState(1.0);
    const [leftMaxT, setLeftMaxT] = useState(2048);
    const [leftTopP, setLeftTopP] = useState(1.0);
    const [leftFreq, setLeftFreq] = useState(0);
    const [leftPres, setLeftPres] = useState(0);

    const [rightModel, setRightModel] = useState('gpt-4o');
    const [rightResponseFmt, setRightResponseFmt] = useState('text');
    const [rightFunctions, setRightFunctions] = useState<IFunctionDef[]>([]);
    const [rightTemp, setRightTemp] = useState(1.0);
    const [rightMaxT, setRightMaxT] = useState(2048);
    const [rightTopP, setRightTopP] = useState(1.0);
    const [rightFreq, setRightFreq] = useState(0);
    const [rightPres, setRightPres] = useState(0);

    /**
     * Opcional: Si quieres que cada vez que el chat principal cambie,
     *           CompareView muestre lo mismo en left y right, usa un useEffect.
     *           Así, se "sincroniza" automáticamente.
     */
    useEffect(() => {
        setLeftMessages(mainMessages);
        setRightMessages(mainMessages);
    }, [mainMessages, setLeftMessages, setRightMessages]);

    // Al presionar "Run", agregamos mensajes a left, right y al principal
    const handleSend = () => {
        if (!inputVal.trim()) return;

        // Mensaje de user
        const userMsg: IMessageData = {
            id: Date.now(),
            role: 'user',
            content: inputVal.trim(),
            originalContent: inputVal.trim()
        };

        // Mensaje de assistant
        const asstMsg: IMessageData = {
            id: Date.now() + 1,
            role: 'assistant',
            content: `(Compare) => Respuesta a: "${inputVal.trim()}"`,
            originalContent: `(Compare) => Respuesta a: "${inputVal.trim()}"`
        };

        // Agregamos en left
        setLeftMessages(prev => [...prev, userMsg, asstMsg]);
        // Agregamos en right
        setRightMessages(prev => [...prev, userMsg, asstMsg]);
        // También al chat principal
        setMainMessages(prev => [...prev, userMsg, asstMsg]);

        // Limpiamos el input
        setInputVal('');
    };

    // Manejo de menú left
    const handleLeftMenuClick = (e: React.MouseEvent<SVGElement>) => {
        setLeftMenuAnchor(e.currentTarget.getBoundingClientRect());
    };
    // Manejo de menú right
    const handleRightMenuClick = (e: React.MouseEvent<SVGElement>) => {
        setRightMenuAnchor(e.currentTarget.getBoundingClientRect());
    };

    // Manejo de config left
    const handleLeftConfigClick = (e: React.MouseEvent<SVGElement>) => {
        setLeftConfigAnchor(e.currentTarget.getBoundingClientRect());
    };
    // Manejo de config right
    const handleRightConfigClick = (e: React.MouseEvent<SVGElement>) => {
        setRightConfigAnchor(e.currentTarget.getBoundingClientRect());
    };

    // Acciones del menú left
    const doLeftAction = (action: string) => {
        if (action === 'viewCode') {
            setLeftCodeOpen(true);
        } else if (action === 'sync') {
            // Copiar del right => left
            setLeftMessages(rightMessages.map(m => ({ ...m, id: Date.now() + Math.random() })));
        } else if (action === 'clear') {
            setLeftMessages([]);
        } else if (action === 'moveRight') {
            setRightMessages([
                ...rightMessages,
                ...leftMessages.map(m => ({ ...m, id: Date.now() + Math.random() }))
            ]);
            setLeftMessages([]);
        }
        setLeftMenuAnchor(null);
    };

    // Acciones del menú right
    const doRightAction = (action: string) => {
        if (action === 'viewCode') {
            setRightCodeOpen(true);
        } else if (action === 'sync') {
            // Copiar del left => right
            setRightMessages(leftMessages.map(m => ({ ...m, id: Date.now() + Math.random() })));
        } else if (action === 'clear') {
            setRightMessages([]);
        } else if (action === 'moveLeft') {
            setLeftMessages([
                ...leftMessages,
                ...rightMessages.map(m => ({ ...m, id: Date.now() + Math.random() }))
            ]);
            setRightMessages([]);
        }
        setRightMenuAnchor(null);
    };

    return (
        <>
            <CompareContainer>
                {/* LEFT column */}
                <Column>
                    <TopBar>
                        <RowLeft>
                            <ModelSelect
                                value={leftModel}
                                onChange={e => setLeftModel(e.target.value)}
                            >
                                <option>gpt-4o</option>
                                <option>gpt-4o-mini</option>
                                <option>01-preview-2024-09-12</option>
                            </ModelSelect>
                        </RowLeft>
                        <RowRight>
                            <FiSettings style={{cursor:'pointer'}} onClick={handleLeftConfigClick} />
                            <FiMoreHorizontal style={{cursor:'pointer'}} onClick={handleLeftMenuClick} />
                        </RowRight>
                    </TopBar>

                    <MessagesArea>
                        {leftMessages.map((msg, idx) => (
                            <Bubble key={idx}>{`${msg.role}: ${msg.content}`}</Bubble>
                        ))}
                    </MessagesArea>

                    <TimingBar>
                        <div><FiZap/> 1,395ms</div>
                        <div><FiArrowUp/> 504t</div>
                        <div><FiArrowDown/> 162t</div>
                        <div><FiClipboard/> Request ID</div>
                    </TimingBar>
                </Column>

                {/* RIGHT column */}
                <Column>
                    <TopBar>
                        <RowLeft>
                            <ModelSelect
                                value={rightModel}
                                onChange={e => setRightModel(e.target.value)}
                            >
                                <option>gpt-4o</option>
                                <option>gpt-4o-mini</option>
                                <option>01-preview-2024-09-12</option>
                            </ModelSelect>
                        </RowLeft>
                        <RowRight>
                            <FiSettings style={{cursor:'pointer'}} onClick={handleRightConfigClick} />
                            <FiMoreHorizontal style={{cursor:'pointer'}} onClick={handleRightMenuClick} />
                        </RowRight>
                    </TopBar>

                    <MessagesArea>
                        {rightMessages.map((msg, idx) => (
                            <Bubble key={idx}>{`${msg.role}: ${msg.content}`}</Bubble>
                        ))}
                    </MessagesArea>

                    <TimingBar>
                        <div><FiZap/> 1,295ms</div>
                        <div><FiArrowUp/> 501t</div>
                        <div><FiArrowDown/> 99t</div>
                        <div><FiClipboard/> Request ID</div>
                    </TimingBar>
                </Column>
            </CompareContainer>

            {/* Footer con un único input */}
            <Footer>
                <InputBox
                    placeholder="Type your message and run in both..."
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                />
                <RunButton onClick={handleSend}>Run</RunButton>
            </Footer>

            {/* MENUS */}
            {leftMenuAnchor && (
                <CompareColumnMenu
                    anchorRect={leftMenuAnchor}
                    side="left"
                    onClose={() => setLeftMenuAnchor(null)}
                    onAction={doLeftAction}
                />
            )}
            {rightMenuAnchor && (
                <CompareColumnMenu
                    anchorRect={rightMenuAnchor}
                    side="right"
                    onClose={() => setRightMenuAnchor(null)}
                    onAction={doRightAction}
                />
            )}

            {/* CONFIGS */}
            {leftConfigAnchor && (
                <CompareColumnConfig
                    anchorRect={leftConfigAnchor}
                    side="left"
                    onClose={() => setLeftConfigAnchor(null)}

                    model={leftModel} setModel={setLeftModel}
                    responseFormat={leftResponseFmt} setResponseFormat={setLeftResponseFmt}
                    functionsList={leftFunctions} setFunctionsList={setLeftFunctions}
                    temp={leftTemp} setTemp={setLeftTemp}
                    maxTokens={leftMaxT} setMaxTokens={setLeftMaxT}
                    topP={leftTopP} setTopP={setLeftTopP}
                    freqPenalty={leftFreq} setFreqPenalty={setLeftFreq}
                    presPenalty={leftPres} setPresPenalty={setLeftPres}
                />
            )}
            {rightConfigAnchor && (
                <CompareColumnConfig
                    anchorRect={rightConfigAnchor}
                    side="right"
                    onClose={() => setRightConfigAnchor(null)}

                    model={rightModel} setModel={setRightModel}
                    responseFormat={rightResponseFmt} setResponseFormat={setRightResponseFmt}
                    functionsList={rightFunctions} setFunctionsList={setRightFunctions}
                    temp={rightTemp} setTemp={setRightTemp}
                    maxTokens={rightMaxT} setMaxTokens={setRightMaxT}
                    topP={rightTopP} setTopP={setRightTopP}
                    freqPenalty={rightFreq} setFreqPenalty={setRightFreq}
                    presPenalty={rightPres} setPresPenalty={setRightPres}
                />
            )}

            {/* CODE modals */}
            {leftCodeOpen && (
                <CompareViewCodeModal
                    side="left"
                    onClose={() => setLeftCodeOpen(false)}
                    messages={leftMessages}
                    model={leftModel}
                    responseFormat={leftResponseFmt}
                    tempValue={leftTemp}
                    maxTokens={leftMaxT}
                    topP={leftTopP}
                    freqPenalty={leftFreq}
                    presPenalty={leftPres}
                    functionsList={leftFunctions}
                />
            )}
            {rightCodeOpen && (
                <CompareViewCodeModal
                    side="right"
                    onClose={() => setRightCodeOpen(false)}
                    messages={rightMessages}
                    model={rightModel}
                    responseFormat={rightResponseFmt}
                    tempValue={rightTemp}
                    maxTokens={rightMaxT}
                    topP={rightTopP}
                    freqPenalty={rightFreq}
                    presPenalty={rightPres}
                    functionsList={rightFunctions}
                />
            )}
        </>
    );
};

export default CompareView;
