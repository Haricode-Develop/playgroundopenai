// src/components/compare/CompareColumnMenu.tsx

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
    FiCode,
    FiRefreshCw,
    FiTrash2,
    FiArrowLeft,
    FiArrowRight
} from 'react-icons/fi';

interface Props {
    anchorRect: DOMRect;
    side: 'left' | 'right';
    onAction: (action: string) => void;
    onClose: () => void;
}

const MenuContainer = styled.div`
    position: fixed;
    background: #2f2f2f;
    border: 1px solid #444;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    z-index: 9999;
`;

const Item = styled.div`
    padding: 0.5rem 1rem;
    color: #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: #3a3a3a;
        color: #fff;
    }
`;

const CompareColumnMenu: React.FC<Props> = ({
                                                anchorRect,
                                                side,
                                                onAction,
                                                onClose
                                            }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleDocClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleDocClick);
        return () => {
            document.removeEventListener('mousedown', handleDocClick);
        };
    }, [onClose]);

    const top = anchorRect.bottom + 5;
    const left = anchorRect.left;

    return (
        <MenuContainer
            ref={ref}
            style={{ top, left }}
        >
            <Item onClick={() => onAction('viewCode')}>
                <FiCode /> View code
            </Item>
            <Item onClick={() => onAction('sync')}>
                <FiRefreshCw /> Sync messages
            </Item>
            <Item onClick={() => onAction('clear')}>
                <FiTrash2 /> Clear chat
            </Item>
            {side === 'left' ? (
                <Item onClick={() => onAction('moveRight')}>
                    <FiArrowRight /> Move right
                </Item>
            ) : (
                <Item onClick={() => onAction('moveLeft')}>
                    <FiArrowLeft /> Move left
                </Item>
            )}
        </MenuContainer>
    );
};

export default CompareColumnMenu;
