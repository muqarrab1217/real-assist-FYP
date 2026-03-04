import React, { useState } from 'react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { Payment } from '@/types';
import { cn } from '@/lib/utils';

interface PaymentCalendarProps {
    payments: Payment[];
    dueDay?: number;
    className?: string;
}

export const PaymentCalendar: React.FC<PaymentCalendarProps> = ({ payments, dueDay, className }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const days = [];
    const totalDays = daysInMonth(year, currentDate.getMonth());
    const startDay = firstDayOfMonth(year, currentDate.getMonth());

    // Add empty slots for the first week
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 md:h-14" />);
    }

    // Helper to check for payments on a specific day
    const getPaymentsForDay = (day: number) => {
        return payments.filter(p => {
            const d = new Date(p.dueDate);
            return d.getDate() === day &&
                d.getMonth() === currentDate.getMonth() &&
                d.getFullYear() === year;
        });
    };

    for (let d = 1; d <= totalDays; d++) {
        const dayPayments = getPaymentsForDay(d);
        const hasOverdue = dayPayments.some(p => p.status === 'overdue');
        const hasPending = dayPayments.some(p => p.status === 'pending');
        const hasPaid = dayPayments.some(p => p.status === 'paid');

        const isToday = d === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            year === new Date().getFullYear();

        const isFuture = new Date(year, currentDate.getMonth(), d) > new Date();

        // Check if this is the recurring due day
        const isDueDay = d === dueDay;

        days.push(
            <div
                key={d}
                className={cn(
                    "h-10 md:h-14 flex flex-col items-center justify-center rounded-xl transition-all relative group cursor-default",
                    isToday && "bg-white/5 border border-white/20 z-10",
                    !isToday && "hover:bg-white/5",
                    isDueDay && "bg-gold-500/10 border border-gold-500/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]",
                    dayPayments.length > 0 && !isToday && !isDueDay && "bg-gold-500/[0.02]"
                )}
            >
                {isDueDay && (
                    <div className="absolute top-1 right-1">
                        <div className="w-1 h-1 rounded-full bg-gold-500 animate-ping" />
                    </div>
                )}

                <span className={cn(
                    "text-sm font-bold",
                    isDueDay ? "text-gold-400" : (isToday ? "text-white" : (dayPayments.length > 0 ? "text-gold-200" : "text-gray-400"))
                )}>
                    {d}
                </span>

                <div className="flex gap-1 mt-1">
                    {hasPaid && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Settled" />
                    )}
                    {hasOverdue && (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" title="Overdue" />
                    )}
                    {hasPending && !hasOverdue && (
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]",
                            isFuture ? "bg-gold-500/40" : "bg-gold-500 animate-pulse"
                        )} title="Pending" />
                    )}
                </div>

                {/* Tooltip on hover - Only show if there's a payment or it's the due day */}
                {(dayPayments.length > 0 || isDueDay) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#111] border border-gold-500/20 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                        <p className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-1">
                            {isDueDay ? 'Monthly Due Date' : (isFuture ? 'Upcoming Payment' : 'Due/Past Payment')}
                        </p>
                        {dayPayments.length > 0 ? (
                            dayPayments.map(p => (
                                <div key={p.id} className="text-xs text-white">
                                    <span className="font-bold">#{p.installmentNumber}</span>: PKR {p.amount.toLocaleString()}
                                    <span className={cn(
                                        "ml-2 font-bold",
                                        p.status === 'paid' ? "text-green-500" : (p.status === 'overdue' ? "text-red-500" : "text-gold-500")
                                    )}>
                                        ({p.status})
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-[10px] text-gray-400">Regular recurring payment date for your portfolio installments.</p>
                        )}
                    </div>
                )}
            </div>
        );
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={cn("bg-[#0f0f0f]/40 border border-gold-500/10 rounded-3xl p-6 backdrop-blur-sm", className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/20">
                        <CalendarIcon className="h-5 w-5 text-gold-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">
                            {monthName} <span className="text-gold-500">{year}</span>
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Payment Schedule</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gold-500/10 rounded-lg border border-gold-500/5 transition-colors"
                    >
                        <ChevronLeftIcon className="h-4 w-4 text-gold-500" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gold-500/10 rounded-lg border border-gold-500/5 transition-colors"
                    >
                        <ChevronRightIcon className="h-4 w-4 text-gold-500" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] uppercase font-bold text-gray-600 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>

            <div className="mt-6 pt-6 border-t border-gold-500/5 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gold-500" />
                    <span className="text-gray-500">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-500">Settled</span>
                </div>
            </div>
        </div>
    );
};
