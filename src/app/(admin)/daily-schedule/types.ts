
export interface PersonalItem {
    id: string;
    title: string;
    content: string;
    status: string;
    due_date: string | null;
    metadata: any;
    recurrence: string | null;
    position: number;
}

export type ViewMode = 'protocol' | 'list' | 'focus' | 'archive' | 'card';

export interface CalendarProps {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    calendarView: 'week' | 'month' | 'year';
    setCalendarView: (view: 'week' | 'month' | 'year') => void;
    isDarkMode: boolean;
    getLocalDateString: (date: Date) => string;
}
