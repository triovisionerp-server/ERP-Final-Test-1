// app/actions/dashboardActions.ts

'use server'; // 👈 Server Action directive

import { db } from '@/lib/firebase-admin';

// Define the expected structure for a Job Document
interface Job {
    id: string; // The Firestore document ID
    status: 'In Progress' | 'Completed' | 'Pending';
    teei: number; // Time & Energy Efficiency Index (based on your dashboard)
    teamLead: string;
    // Add all other fields your dashboard needs here...
}

/**
 * Fetches all necessary data for the MD Dashboard from Firestore.
 */
export async function getDashboardData(): Promise<Job[]> {
    try {
        // Target the 'jobs' collection based on your code structure
        const jobsSnapshot = await db.collection('jobs').get(); 

        const jobs: Job[] = jobsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id, // Get the actual document ID
                status: data.jobStatus || 'Pending', // Match your data fields
                teei: data.teei || 0.0,
                teamLead: data.teamLead || 'N/A',
                // Map other necessary fields...
            };
        });

        // The MD dashboard needs ALL jobs to calculate stats like Total Jobs, Completed, etc.
        return jobs;

    } catch (error) {
        // Log the server-side error for debugging in your terminal
        console.error('SERVER ACTION ERROR: Failed to fetch dashboard data:', error);
        return []; // Return an empty array on failure
    }
}