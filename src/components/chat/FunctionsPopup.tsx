// src/components/chat/FunctionsPopup.tsx

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { IFunctionDef } from '../../pages/PlaygroundPage';
import { FiBox } from 'react-icons/fi';

interface Props {
    anchorRect: DOMRect | null;
    functionsList: IFunctionDef[];
    onSelectFunction: (fn: IFunctionDef) => void;
    onClose: () => void;
}

const FunctionsContainer = styled.div`
    position: fixed;
    z-index: 9999;
    background-color: #2f2f2f;
    border: 1px solid #444;
    border-radius: 6px;
    padding: 0.5rem;
    min-width: 200px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);
`;

const FnItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    color: #ccc;

    &:hover {
        background-color: #3a3a3a;
    }
    svg {
        font-size: 1rem;
    }
`;

const FunctionsPopup: React.FC<Props> = ({
                                             anchorRect,
                                             functionsList,
                                             onSelectFunction,
                                             onClose
                                         }) => {
    useEffect(() => {
        if (!anchorRect) {
            onClose();
        }
    }, [anchorRect, onClose]);

    if (!anchorRect) return null;

    const top = anchorRect.bottom + 4;
    const left = anchorRect.left;

    return (
        <FunctionsContainer style={{ top, left }}>
            {functionsList.map((fn, idx) => (
                <FnItem key={idx} onClick={() => onSelectFunction(fn)}>
                    <FiBox />
                    {fn.name}
                </FnItem>
            ))}
            {functionsList.length < 1 && (
                <div style={{ fontSize: '0.85rem', color: '#999' }}>
                    No functions
                </div>
            )}
        </FunctionsContainer>
    );
};

export default FunctionsPopup;
