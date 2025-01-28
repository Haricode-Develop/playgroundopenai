// src/components/history/HistoryPanel.tsx

import React, { useRef } from 'react';
import styled from 'styled-components';
import { FiDownload, FiTrash2, FiX } from 'react-icons/fi';

// Interfaz local (ajusta según tu uso)
interface IHistoryItem {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const Container = styled.div`
    width: 300px;
    background-color: #1f1f1f;
    border-left: 1px solid #333;
    display: flex;
    flex-direction: column;
    padding: 1rem;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    margin-bottom: 0.5rem;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
`;

const ActionsRow = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const IconButton = styled.button`
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    &:hover {
        color: #fff;
    }
`;

const ScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;
    border-top: 1px solid #333;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    color: #ccc;
    font-size: 0.85rem;
`;

const TimelineDateGroup = styled.div`
    margin-bottom: 1rem;
`;

const DateLabel = styled.div`
    color: #999;
    font-size: 0.8rem;
    margin: 0.5rem 0;
    text-transform: uppercase;
    font-weight: 500;
`;

const TimelineList = styled.div`
    position: relative;
    margin-left: 1.2rem;
    border-left: 2px solid #444;
    padding-left: 1rem;
`;

const TimelineItem = styled.div`
    position: relative;
    margin-bottom: 1rem;

    &:hover {
        background-color: #333;
        border-radius: 4px;
        padding: 0.3rem;
    }
`;

const TimelineDot = styled.div`
    position: absolute;
    left: -1.26rem;
    top: 0.35rem;
    width: 0.6rem;
    height: 0.6rem;
    background-color: #888;
    border-radius: 50%;
`;

const TimeLabel = styled.span`
    color: #888;
    margin-right: 0.5rem;
    font-size: 0.75rem;
`;

const InfoLine = styled.div`
    color: #999;
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
`;

interface HistoryProps {
    historyRecords: IHistoryItem[];
    onClosePanel: () => void;
    onClearHistory: () => void;
    onDownloadHistory: () => void;

    // El array COMPLETO de mensajes del chat principal
    fullMessages: any[];
    // Para sobrescribir los mensajes cuando se hace hover en un item
    setFilteredMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

const HistoryPanel: React.FC<HistoryProps> = ({
                                                  historyRecords,
                                                  onClosePanel,
                                                  onClearHistory,
                                                  onDownloadHistory,
                                                  fullMessages,
                                                  setFilteredMessages
                                              }) => {

    // Usamos un ref para asegurar que siempre almacenamos/recuperamos la versión correcta
    const originalRef = useRef<any[] | null>(null);

    const groupedByDate = groupHistoryByDate(historyRecords);

    // Mostrar SOLO el item hovered
    const handleMouseEnter = (item: IHistoryItem) => {
        // Guardamos SIEMPRE la versión más reciente de la conversación
        originalRef.current = [...fullMessages];

        setFilteredMessages([{
            id: Date.now(), // ID único
            role: item.role,
            content: item.content,
            isDisliked: false,
            isJson: false,
            originalContent: item.content
        }]);
    };

    // Restablecer TODOS los mensajes al quitar hover
    const handleMouseLeave = () => {
        // Si por alguna razón no tenemos nada guardado, no hacemos nada
        if (originalRef.current) {
            setFilteredMessages(originalRef.current);
            originalRef.current = null;
        }
    };

    return (
        <Container>
            <HeaderRow>
                <Title>30-day history</Title>
                <ActionsRow>
                    <IconButton onClick={onDownloadHistory} title="Download JSON">
                        <FiDownload />
                    </IconButton>
                    <IconButton onClick={onClearHistory} title="Clear all history">
                        <FiTrash2 />
                    </IconButton>
                    <IconButton onClick={onClosePanel} title="Close history">
                        <FiX />
                    </IconButton>
                </ActionsRow>
            </HeaderRow>

            <ScrollArea>
                <InfoLine>
                    Conversations with images or audio are not available in playground history.
                </InfoLine>
                {Object.keys(groupedByDate)
                    .sort((a,b) => new Date(b).getTime() - new Date(a).getTime())
                    .map(dateStr => {
                        const items = groupedByDate[dateStr];
                        return (
                            <TimelineDateGroup key={dateStr}>
                                <DateLabel>{dateStr}</DateLabel>
                                <TimelineList>
                                    {items.map((itm, idx) => (
                                        <TimelineItem
                                            key={idx}
                                            onMouseEnter={() => handleMouseEnter(itm)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <TimelineDot />
                                            <TimeLabel>{formatTime(itm.timestamp)}</TimeLabel>
                                            {renderShortContent(itm)}
                                        </TimelineItem>
                                    ))}
                                </TimelineList>
                            </TimelineDateGroup>
                        );
                    })}
            </ScrollArea>
        </Container>
    );
};

// Funciones auxiliares

function groupHistoryByDate(records: IHistoryItem[]) {
    const map: Record<string, IHistoryItem[]> = {};
    for (const r of records) {
        const d = new Date(r.timestamp);
        const y = d.getFullYear();
        const M = String(d.getMonth()+1).padStart(2,'0');
        const day = String(d.getDate()).padStart(2,'0');
        const dateKey = `${getWeekday(d)}, ${formatMonth(d)} ${day}, ${y}`;
        if(!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(r);
    }
    return map;
}

function getWeekday(d:Date){
    const daynames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return daynames[d.getDay()].toUpperCase();
}

function formatMonth(d:Date){
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()].toUpperCase();
}

function formatTime(d:Date){
    let hr = d.getHours();
    const ampm = hr>=12 ? 'PM' : 'AM';
    hr = hr % 12;
    if(hr===0) hr=12;
    const min = String(d.getMinutes()).padStart(2,'0');
    return `${hr}:${min} ${ampm}`;
}

function renderShortContent(item: IHistoryItem){
    const prefix = (item.role==='assistant') ? 'Assistant: ' : 'User: ';
    let txt = item.content || '<empty>';
    if(txt.length > 60){
        txt = txt.slice(0,60) + '...';
    }
    return prefix + txt;
}

export default HistoryPanel;
