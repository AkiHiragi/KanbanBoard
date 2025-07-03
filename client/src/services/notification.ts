import { Task } from '../types';
import { differenceInMinutes, isPast } from 'date-fns';

class NotificationService {
    private notifiedTaskIds = new Set<string>();
    private timeoutIds: Record<string, number> = {};
    
    // Настраиваем уведомления для всех задач
    setupNotifications(tasks: Task[]) {
        // Очищаем все существующие таймауты
        this.clearAllTimeouts();
        
        // Настраиваем новые уведомления для задач с дедлайнами
        tasks.forEach(task => {
            if (task.dueDate && task.hasNotification && !isPast(task.dueDate)) {
                this.scheduleNotification(task);
            }
        });
    }
    
    // Планируем уведомление для конкретной задачи
    private scheduleNotification(task: Task) {
        if (!task.dueDate || !task.hasNotification) return;
        
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const minutesToDeadline = differenceInMinutes(dueDate, now);
        
        // Если до дедлайна меньше 15 минут, показываем уведомление сразу
        if (minutesToDeadline <= 15 && minutesToDeadline > 0 && !this.notifiedTaskIds.has(task.id)) {
            this.showNotification(task);
            return;
        }
        
        // Если до дедлайна больше 15 минут, планируем уведомление
        if (minutesToDeadline > 15) {
            const notifyAt = new Date(dueDate.getTime() - 15 * 60 * 1000);
            const timeToNotify = notifyAt.getTime() - now.getTime();
            
            // Устанавливаем таймаут для уведомления
            this.timeoutIds[task.id] = window.setTimeout(() => {
                if (!this.notifiedTaskIds.has(task.id)) {
                    this.showNotification(task);
                }
            }, timeToNotify);
        }
    }
    
    // Показываем уведомление
    private showNotification(task: Task) {
        // Отмечаем задачу как уведомленную
        this.notifiedTaskIds.add(task.id);
        
        // Проверяем поддержку уведомлений
        if (!('Notification' in window)) {
            alert(`Дедлайн через 15 минут: ${task.title}`);
            return;
        }
        
        // Показываем уведомление, если разрешено
        if (Notification.permission === 'granted') {
            new Notification('Напоминание о задаче', {
                body: `Дедлайн через 15 минут: ${task.title}`,
                icon: '/favicon.ico'
            });
        }
    }
    
    // Очищаем все таймауты
    clearAllTimeouts() {
        Object.values(this.timeoutIds).forEach(id => window.clearTimeout(id));
        this.timeoutIds = {};
    }
    
    // Сбрасываем состояние для конкретной задачи
    resetTask(taskId: string) {
        // Удаляем из списка уведомленных
        this.notifiedTaskIds.delete(taskId);
        
        // Очищаем таймаут, если он есть
        if (this.timeoutIds[taskId]) {
            window.clearTimeout(this.timeoutIds[taskId]);
            delete this.timeoutIds[taskId];
        }
    }
}

export const notificationService = new NotificationService();