import React from 'react';
import styled from 'styled-components';
import {
    FiSearch,
    FiActivity,
    FiUser,
    FiHeadphones,
    FiBookOpen,
    FiUsers,
    FiHelpCircle,
    FiColumns
} from 'react-icons/fi';

interface SidebarProps {
    onToggleSidebar: () => void;
    isOpen: boolean;
}

const SidebarContainer = styled.div<{ isOpen: boolean }>`
    background-color: #000;
    color: #ccc;
    position: relative;
    display: flex;
    flex-direction: column;
    width: ${({ isOpen }) => (isOpen ? '200px' : '0px')};
    transition: width 0.3s ease;
    overflow: hidden;
`;

const SidebarHeader = styled.div`
    padding: 1rem;
    font-size: 1.2rem;
    border-bottom: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
`;

const SidebarMenu = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    flex: 1;
`;

const SidebarItem = styled.div<{ active?: boolean }>`
    display: flex;
    align-items: center;
    padding: 0.75rem;
    margin: 0.25rem 0;
    background-color: ${({ active }) => (active ? '#3a3a3a' : 'transparent')};
    border-radius: 4px;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
        background-color: #2f2f2f;
    }

    svg {
        margin-right: 0.5rem;
    }
`;

const SidebarFooter = styled.div`
    border-top: 1px solid #333;
    padding: 0.5rem;
`;

const FooterLink = styled.div`
    display: flex;
    align-items: center;
    color: #aaa;
    font-size: 0.85rem;
    margin: 0.25rem 0;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:hover {
        background-color: #1f1f1f;
        color: #fff;
    }

    svg {
        margin-right: 0.5rem;
    }
`;

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggleSidebar }) => {
    return (
        <SidebarContainer isOpen={isOpen}>
            {isOpen && (
                <SidebarHeader>
                    <div className="title">Playground</div>
                    <FiColumns className="close-btn" onClick={onToggleSidebar} />
                </SidebarHeader>
            )}

            {isOpen && (
                <>
                    <SidebarMenu>
                        <SidebarItem active>
                            <FiSearch />
                            Chat
                        </SidebarItem>
                        <SidebarItem>
                            <FiActivity />
                            Realtime
                        </SidebarItem>
                        <SidebarItem>
                            <FiUser />
                            Assistants
                        </SidebarItem>
                        <SidebarItem>
                            <FiHeadphones />
                            TTS
                        </SidebarItem>
                    </SidebarMenu>

                    <SidebarFooter>
                        <FooterLink>
                            <FiBookOpen />
                            Cookbook
                        </FooterLink>
                        <FooterLink>
                            <FiUsers />
                            Forum
                        </FooterLink>
                        <FooterLink>
                            <FiHelpCircle />
                            Help
                        </FooterLink>
                    </SidebarFooter>
                </>
            )}
        </SidebarContainer>
    );
};

export default Sidebar;
