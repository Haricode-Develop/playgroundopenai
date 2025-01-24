import styled, { css } from 'styled-components';

export const PageContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
`;

interface MainContentProps {
    isCompareMode?: boolean;
}

export const MainContent = styled.div<MainContentProps>`
    display: flex;
    flex-direction: column;
    flex: 1;
    background-color: #252526;
    overflow: hidden;

    transition: all 0.4s ease;
    ${({ isCompareMode }) =>
            isCompareMode
                    ? css`
                        /* Compare mode */
                    `
                    : css`
                        /* Normal mode */
                    `}
`;

export const SidebarToggleButton = styled.button`
    position: absolute;
    top: 1rem;
    left: 0.5rem;
    background-color: #2f2f2f;
    border: 1px solid #444;
    color: #fff;
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    cursor: pointer;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: background 0.3s ease;

    &:hover {
        background-color: #3a3a3a;
    }

    svg {
        font-size: 1.1rem;
    }
`;
