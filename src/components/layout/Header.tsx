// src/components/layout/Header.tsx

import React from 'react';
import styled from 'styled-components';
import {
    FiTrash2,
    FiCode,
    FiGitBranch,
    FiClock
} from 'react-icons/fi';

const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background-color: #2f2f2f;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #333;
`;

const HeaderButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    color: #ccc;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    font-size: 0.9rem;
    border-radius: 4px;
    transition: background 0.2s;
    &:hover {
        background-color: #3a3a3a;
        color: #fff;
    }
    svg {
        font-size: 1rem;
    }
`;

export interface HeaderProps {
    onClickViewCode: () => void;
    onToggleCompare: () => void;
    onClear: () => void;
    onToggleHistory?: () => void;
}

const Header: React.FC<HeaderProps> = ({
                                           onClickViewCode,
                                           onToggleCompare,
                                           onClear,
                                           onToggleHistory
                                       }) => {
    return (
        <HeaderContainer>
            <HeaderButton onClick={onClear}>
                <FiTrash2/>
                Clear
            </HeaderButton>
            <HeaderButton onClick={onClickViewCode}>
                <FiCode/>
                Code
            </HeaderButton>
            <HeaderButton onClick={onToggleCompare}>
                <FiGitBranch/>
                Compare
            </HeaderButton>
            {onToggleHistory && (
                <HeaderButton onClick={onToggleHistory}>
                    <FiClock/>
                    History
                </HeaderButton>
            )}
        </HeaderContainer>
    );
};

export default Header;
