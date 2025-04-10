#!/usr/bin/env node

/**
 * This script adds sample data to the Google Sheets database for testing
 * Note: For production use, you should remove this script or add proper validation
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import the service functions
const { addClient } = require('../lib/client-service');
const { addSession } = require('../lib/session-service');
const { recordAttendance } = require('../lib/attendance-service');

// Sample data
const sampleClients = [
  {
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    phone: '555-123-4567',
    registrationDate: new Date('2025-01-15').toISOString(),
    isActive: true,
    notes: 'Intermediate swimmer'
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '555-234-5678',
    registrationDate: new Date('2025-02-03').toISOString(),
    isActive: true,
    notes: 'Advanced, training for competition'
  },
  {
    name: 'Sophia Rodriguez',
    email: 'sophia.r@example.com',
    phone: '555-345-6789',
    registrationDate: new Date('2025-03-20').toISOString(),
    isActive: true,
    notes: 'Beginner, focusing on technique'
  }
];

const sampleSessions = [
  {
    name: 'Morning Lap Swim',
    startTime: new Date('2025-04-10T07:00:00').toISOString(),
    endTime: new Date('2025-04-10T08:00:00').toISOString(),
    maxAttendees: 8,
    description: 'Open lap swimming session for all levels',
    location: 'Main Pool'
  },
  {
    name: 'Beginner Technique',
    startTime: new Date('2025-04-10T09:30:00').toISOString(),
    endTime: new Date('2025-04-10T10:30:00').toISOString(),
    maxAttendees: 10,
    description: 'Technique fundamentals for beginners',
    location: 'Training Pool'
  },
  {
    name: 'Advanced Training',
    startTime: new Date('2025-04-10T16:00:00').toISOString(),
    endTime: new Date('2025-04-10T17:30:00').toISOString(),
    maxAttendees: 6,
    description: 'High-intensity training for advanced swimmers',
    location: 'Competition Pool'
  }
];

async function addSampleData() {
  try {
    console.log('🔄 Adding sample data to Google Sheets...');
    
    // Add clients
    console.log('👤 Adding sample clients...');
    const clients = [];
    for (const clientData of sampleClients) {
      const client = await addClient(clientData);
      clients.push(client);
      console.log(`  ✅ Added client: ${client.name}`);
    }
    
    // Add sessions
    console.log('📅 Adding sample sessions...');
    const sessions = [];
    for (const sessionData of sampleSessions) {
      const session = await addSession(sessionData);
      sessions.push(session);
      console.log(`  ✅ Added session: ${session.name}`);
    }
    
    // Add some attendance records
    console.log('✓ Adding sample attendance records...');
    // Record Emma at Morning Lap Swim
    await recordAttendance(clients[0].id, sessions[0].id, 'Regular attendee');
    console.log(`  ✅ Recorded attendance for ${clients[0].name} at ${sessions[0].name}`);
    
    // Record Michael at Advanced Training
    await recordAttendance(clients[1].id, sessions[2].id, 'Preparing for competition');
    console.log(`  ✅ Recorded attendance for ${clients[1].name} at ${sessions[2].name}`);
    
    // Record Sophia at Beginner Technique
    await recordAttendance(clients[2].id, sessions[1].id, 'First session');
    console.log(`  ✅ Recorded attendance for ${clients[2].name} at ${sessions[1].name}`);
    
    console.log('✨ Sample data added successfully!');
    console.log('🚀 You can now start the SwimFit app and test with this data');
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  }
}

// Run the sample data addition
addSampleData();
