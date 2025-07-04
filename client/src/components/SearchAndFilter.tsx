import {Priority} from "../types";
import React from "react";

interface SearchAndFilterProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedPriority: Priority | 'all';
    onPriorityChange: (priority: Priority | 'all') => void;
    selectedTag: string;
    onTagChange: (tag: string) => void;
    availableTags: string[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
                                                             searchTerm,
                                                             onSearchChange,
                                                             selectedPriority,
                                                             onPriorityChange,
                                                             selectedTag,
                                                             onTagChange,
                                                             availableTags
                                                         }) => {
    return (
        <div className="search-filter-bar">
            <input
                type={"text"}
                placeholder={"Поиск задач..."}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={"search-input"}
            />

            <select
                value={selectedPriority}
                onChange={(e) => onPriorityChange(e.target.value as Priority | 'all')}
                className={"filter-select"}
            >
                <option value="all">Все приоритеты</option>
                <option value="high">🔴 Высокий</option>
                <option value="medium">🟡 Средний</option>
                <option value="low">🟢 Низкий</option>
            </select>

            <select
                value={selectedTag}
                onChange={(e) => onTagChange(e.target.value)}
                className="filter-select"
            >
                <option value="">Все теги</option>
                {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                ))}
            </select>
        </div>
    )
}

export default SearchAndFilter;