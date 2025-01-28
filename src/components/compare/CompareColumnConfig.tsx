// src/components/compare/CompareColumnConfig.tsx

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiBox, FiPlus } from 'react-icons/fi';
import { AddFunctionModal } from '../modals/AddFunctionModal';

interface IFunctionDef {
    name: string;
    jsonDefinition: string;
}

interface Props {
    anchorRect: DOMRect;
    side: 'left' | 'right';
    onClose: () => void;

    // states
    model: string; setModel: (m:string)=>void;
    responseFormat: string; setResponseFormat: (f:string)=>void;
    functionsList: IFunctionDef[]; setFunctionsList: (fn:IFunctionDef[])=>void;
    temp: number; setTemp: (n:number)=>void;
    maxTokens: number; setMaxTokens: (n:number)=>void;
    topP: number; setTopP: (n:number)=>void;
    freqPenalty: number; setFreqPenalty: (n:number)=>void;
    presPenalty: number; setPresPenalty: (n:number)=>void;
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 9999;
`;

const Container = styled.div`
    position: absolute;
    background-color: #2f2f2f;
    border: 1px solid #444;
    border-radius: 6px;
    width: 300px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);
`;

const Header = styled.div`
    font-weight: bold;
    color: #fff;
    padding: 0.5rem;
    border-bottom: 1px solid #333;
`;

const Section = styled.div`
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #333;
`;

const Label = styled.div`
    color: #fff;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
`;

const Select = styled.select`
    width: 100%;
    background-color: #2f2f2f;
    border: 1px solid #444;
    border-radius: 8px;
    color: #fff;
    padding: 0.4rem 0.6rem;
    margin-bottom: 0.75rem;
`;

const FnList = styled.div`
    margin-bottom: 0.5rem;
`;

const FnItem = styled.div`
    background-color: #2f2f2f;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
    color: #ccc;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.3rem;
    cursor: pointer;
    &:hover {
        background: #3a3a3a;
    }
`;

const AddBtn = styled.button`
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
    &:hover { background-color: #4a4a4a; }
`;

const RangeRow = styled.div`
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    color: #bbb;
    font-size: 0.85rem;
    display: flex;
    justify-content: space-between;
`;

const Range = styled.input`
    width: 100%;
    margin: 0.3rem 0;
`;

const Footer = styled.div`
    padding: 0.5rem;
    border-top: 1px solid #333;
    display: flex;
    justify-content: flex-end;
`;

const CloseBtn = styled.button`
    background: #3a3a3a;
    border: none;
    color: #fff;
    border-radius: 6px;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    &:hover {
        background-color: #4a4a4a;
    }
`;

const CompareColumnConfig: React.FC<Props> = ({
                                                  anchorRect,
                                                  side,
                                                  onClose,

                                                  model, setModel,
                                                  responseFormat, setResponseFormat,
                                                  functionsList, setFunctionsList,
                                                  temp, setTemp,
                                                  maxTokens, setMaxTokens,
                                                  topP, setTopP,
                                                  freqPenalty, setFreqPenalty,
                                                  presPenalty, setPresPenalty
                                              }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [showAddFn, setShowAddFn] = useState(false);

    useEffect(()=>{
        function handleDocClick(e: MouseEvent){
            if(!containerRef.current) return;
            if(!overlayRef.current) return;
            if(!containerRef.current.contains(e.target as Node)){
                // Revisar si el AddFunctionModal se está abriendo
                const modals = document.querySelectorAll('.addFnModalOverlay');
                let clickedInModal = false;
                modals.forEach(m => {
                    if(m.contains(e.target as Node)) {
                        clickedInModal = true;
                    }
                });
                if(!clickedInModal){
                    onClose();
                }
            }
        }
        document.addEventListener('mousedown', handleDocClick);
        return ()=> {
            document.removeEventListener('mousedown', handleDocClick);
        };
    },[onClose]);

    const top = anchorRect.bottom + 5;
    const left = anchorRect.left - 280;

    const handleAddFunction = (fn: IFunctionDef) => {
        setFunctionsList([...functionsList, fn]);
    };

    return (
        <Overlay ref={overlayRef}>
            <Container ref={containerRef} style={{ position:'absolute', top, left }}>
                <Header>{side} config</Header>
                <Section>
                    <Label>Model</Label>
                    <Select value={model} onChange={e=> setModel(e.target.value)}>
                        <option>gpt-4o</option>
                        <option>gpt-4o-mini</option>
                        <option>01-preview-2024-09-12</option>
                    </Select>
                </Section>
                <Section>
                    <Label>Response format</Label>
                    <Select value={responseFormat} onChange={e=> setResponseFormat(e.target.value)}>
                        <option>text</option>
                        <option>json</option>
                        <option>json_object</option>
                    </Select>
                </Section>
                <Section>
                    <Label>Functions</Label>
                    <FnList>
                        {functionsList.length<1 && <i style={{color:'#ccc'}}>No functions</i>}
                        {functionsList.map((fn, idx)=>(
                            <FnItem key={idx}>
                                <FiBox/>
                                {fn.name}
                            </FnItem>
                        ))}
                    </FnList>
                    <AddBtn onClick={()=> setShowAddFn(true)}>
                        <FiPlus/> Add
                    </AddBtn>
                </Section>
                <Section>
                    <Label>Model configuration</Label>
                    <RangeRow>
                        <label>Temperature</label>
                        <span>{temp.toFixed(2)}</span>
                    </RangeRow>
                    <Range
                        type='range'
                        min={0}
                        max={2}
                        step={0.01}
                        value={temp}
                        onChange={e=> setTemp(parseFloat(e.target.value))}
                    />
                    <RangeRow>
                        <label>Max tokens</label>
                        <span>{maxTokens}</span>
                    </RangeRow>
                    <Range
                        type='range'
                        min={0}
                        max={32000}
                        step={1}
                        value={maxTokens}
                        onChange={e=> setMaxTokens(parseInt(e.target.value))}
                    />
                    <div style={{marginBottom:'1rem'}}>
                        <label style={{color:'#fff'}}>Stop sequences</label>
                        <input
                            type='text'
                            style={{
                                width:'100%',
                                background:'#2f2f2f',
                                border:'1px solid #444',
                                borderRadius:'6px',
                                color:'#fff',
                                padding:'0.4rem 0.6rem'
                            }}
                            placeholder='Enter sequences...'
                        />
                        <small style={{color:'#666'}}>Enter sequence and press Tab</small>
                    </div>
                    <RangeRow>
                        <label>Top P</label>
                        <span>{topP.toFixed(2)}</span>
                    </RangeRow>
                    <Range
                        type='range'
                        min={0}
                        max={1}
                        step={0.01}
                        value={topP}
                        onChange={e=> setTopP(parseFloat(e.target.value))}
                    />
                    <RangeRow>
                        <label>Frequency penalty</label>
                        <span>{freqPenalty.toFixed(2)}</span>
                    </RangeRow>
                    <Range
                        type='range'
                        min={0}
                        max={2}
                        step={0.01}
                        value={freqPenalty}
                        onChange={e=> setFreqPenalty(parseFloat(e.target.value))}
                    />
                    <RangeRow>
                        <label>Presence penalty</label>
                        <span>{presPenalty.toFixed(2)}</span>
                    </RangeRow>
                    <Range
                        type='range'
                        min={0}
                        max={2}
                        step={0.01}
                        value={presPenalty}
                        onChange={e=> setPresPenalty(parseFloat(e.target.value))}
                    />
                </Section>
                <Footer>
                    <CloseBtn onClick={onClose}>Close</CloseBtn>
                </Footer>
            </Container>

            {showAddFn && (
                <div className="addFnModalOverlay">
                    <AddFunctionModal
                        mode="add"
                        onClose={()=> setShowAddFn(false)}
                        onAddFunction={handleAddFunction}
                    />
                </div>
            )}
        </Overlay>
    );
};

export default CompareColumnConfig;
