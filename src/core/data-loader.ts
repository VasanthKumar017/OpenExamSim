import { Question } from '../types';

/**
 * Fetches exam questions from the local public folder.
 * This is the "Data Layer" of your Micro Frontend.
 */
export async function fetchExamData(): Promise<Question[]> {
    try {
        const response = await fetch('/questions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data as Question[];
    } catch (error) {
        console.error("Could not fetch exam data:", error);
        throw error;
    }
}