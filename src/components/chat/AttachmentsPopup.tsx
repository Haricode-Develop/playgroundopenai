// src/components/chat/AttachmentsPopup.tsx

import React, { useEffect } from 'react';
import styled from 'styled-components';

interface Props {
    anchorRect: DOMRect | null;
    onClose: () => void;
    onLinkImage: () => void;
    onUploadImage: () => void;
}

const PopupContainer = styled.div<{ anchorRect: DOMRect | null }>`
    position: absolute;
    background-color: #1f1f1f;
    border: 1px solid #444;
    border-radius: 6px;
    padding: 0.5rem;
    z-index: 9999;
    width: 180px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);

    ${({ anchorRect }) => {
        if (!anchorRect) return '';
        // Aparece un poco arriba y a la izquierda para no tapar el botón
        const top = anchorRect.top - 100;
        const left = anchorRect.left - 50;
        return `
      top: ${top}px;
      left: ${left}px;
    `;
    }}
`;

const Item = styled.div`
    color: #ccc;
    padding: 0.4rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;

    &:hover {
        background-color: #2a2a2a;
    }
`;

const Disabled = styled.div`
    color: #555;
    padding: 0.4rem 0.5rem;
    font-size: 0.9rem;
    cursor: not-allowed;
`;

const AttachmentsPopup: React.FC<Props> = ({ anchorRect, onClose, onLinkImage, onUploadImage }) => {
    useEffect(() => {
        if (!anchorRect) onClose();
    }, [anchorRect, onClose]);

    const handleLink = () => {
        onLinkImage();
        onClose();
    };

    const handleUpload = () => {
        onUploadImage();
        onClose();
    };

    return (
        <PopupContainer anchorRect={anchorRect}>
            <Item onClick={handleLink}>Link to image</Item>
            <Item onClick={handleUpload}>Upload image</Item>
            <Disabled>Upload audio <br/><small>gpt-4o does not support audio attachments</small></Disabled>
        </PopupContainer>
    );
};

export default AttachmentsPopup;
