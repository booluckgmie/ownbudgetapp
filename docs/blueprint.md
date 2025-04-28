# **App Name**: Commitment Compass

## Core Features:

- Income Input: Allow the user to set a single, editable value for their total income. Store this value persistently and display it prominently.
- Commitment List: Provide a table with columns for commitment name and value. Include an "Add Commitment" button. Allow editing/deleting commitments. Automatically calculate and display the total sum.
- Done Toggle: Add a toggle for each commitment to mark it as "Paid" or "Unpaid". Exclude 'Paid' commitments from the total sum of unpaid commitments. Persist the paid/unpaid status.
- Stats Dashboard: Display a summary section with: Total Unpaid, Total Paid, and Remaining Balance (Income - Total Unpaid). Optionally, include a visual (e.g., pie chart) to show the proportion of paid vs. unpaid commitments.

## Style Guidelines:

- Primary color: A calming blue (#4682B4) to promote a sense of financial security.
- Secondary color: A light gray (#E0E0E0) for backgrounds and subtle contrasts.
- Accent: Green (#32CD32) to indicate 'Paid' commitments and positive balance.
- Clean and minimal layout with clear separation of sections.
- Use simple, recognizable icons for commitments and categories.
- Subtle transitions when marking commitments as paid or unpaid.

## Original User Request:
Building a Simple Spending App**

Create a mobile-friendly web or native app for tracking personal spending with a clean, intuitive interface. The app should include the following features:

Income Input:

Allow the user to set a single, editable value for their total income (e.g., monthly income).
Store this value persistently and display it prominently at the top of the app.
Commitment List:

Provide a table with two columns:
Item: A text field for the name of the commitment (e.g., "Rent", "Groceries").
Value: A numerical field for the cost of the commitment (e.g., 500.00).
Include an "Add Commitment" button to append new rows to the list.
Allow users to edit or delete existing commitments.
Automatically calculate and display the total sum of all commitment values at the bottom of the table.
Done Toggle:

Add a checkbox or toggle for each commitment to mark it as "Paid" or "Unpaid".
When a commitment is marked as "Paid," exclude its value from the total sum of unpaid commitments.
Persist the paid/unpaid status across sessions.
Stats Dashboard:

Display a summary section with:
Total Unpaid: Sum of values for all commitments marked as "Unpaid".
Total Paid: Sum of values for all commitments marked as "Paid".
Remaining Balance: Calculated as Income - Total Unpaid.
Optionally, include a simple visual (e.g., pie chart or progress bar) to show the proportion of paid vs. unpaid commitments.
Additional Requirements:

Ensure data persistence (e.g., using local storage or a lightweight database).
Implement input validation (e.g., positive numbers for values, non-empty item names).
Design a responsive, user-friendly UI with clear labels and minimal clutter.
Include an option to reset all data (e.g., for a new month).
Optimize for performance, ensuring quick load times and smooth interactions.
Optional Enhancements:

Add categories for commitments (e.g., "Bills", "Entertainment") with filtering options.
Allow recurring commitments to auto-populate each month.
Export data as a CSV file for external use.
Include a dark mode toggle for accessibility.
Deliverables:

A functional app with the core features listed above.
Clean, commented code following best practices for the chosen framework (e.g., React Native, Flutter, or JavaScript with HTML/CSS).
A brief user guide explaining how to use the app.
Optional: Unit tests for key functionalities like sum calculations and data persistence.
Quest can be archived and saved, also allow to create a new one.

Simple Spending App
Overview
This guide outlines how to build a mobile-friendly spending app that helps users track their personal spending. The app will include features for income input, a commitment list, a stats dashboard, and more.

Features
1. Income Input
Editable Income Field: A single input field for the user's monthly income.
Persistent Storage: Store the income value so it remains available across sessions.
2. Commitment List
Table Structure: Two columns for item names and commitment values.
Add/Edit/Delete Functionality: Include buttons to add new commitments and edit or delete existing ones.
Automatic Total Calculation: Sum values from commitments and display at the bottom.
3. Done Toggle
Checkbox for Each Commitment: Allow users to mark commitments as paid or unpaid.
Dynamic Total Sum: Exclude paid commitments from the unpaid total.
Persistence of Status: Remember the paid/unpaid status after refreshing.
4. Stats Dashboard
Summary Metrics:
Total Unpaid
Total Paid
Remaining Balance (Income - Total Unpaid)
Visual Representation: Optional pie chart or progress bar for paid vs. unpaid commitments.
5. Additional Requirements
Data Persistence: Use local storage or a lightweight database for data retention.
Input Validation: Ensure all inputs are valid (e.g., positive numbers, non-empty names).
Responsive UI: Design for mobile devices with clear labels.
Reset Functionality: Option to clear all data for a new month.
Performance Optimization: Ensure quick load times and smooth interactions.
6. Optional Enhancements
Categories for Commitments: Add filtering options based on categories.
Recurring Commitments: Allow automatic addition of recurring items.
Export Functionality: Enable CSV data export.
Dark Mode: Include a toggle for dark mode.
Implementation
Tech Stack
Framework: Choose between React Native, Flutter, or a web-based approach using JavaScript with HTML/CSS.
Storage: Use local storage for persistence.
Code Structure
Components: Break down the application into components (e.g., IncomeInput, CommitmentList, StatsDashboard).
State Management: Use state management (like Redux or Context API) for managing app state.
Example Code Snippet (JavaScript with React)
javascript
Copy
import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [income, setIncome] = useState(0);
  const [commitments, setCommitments] = useState([]);
  
  useEffect(() => {
    const storedIncome = localStorage.getItem('income');
    const storedCommitments = JSON.parse(localStorage.getItem('commitments'));
    if (storedIncome) setIncome(Number(storedIncome));
    if (storedCommitments) setCommitments(storedCommitments);
  }, []);

  const addCommitment = (item, value) => {
    setCommitments([...commitments, { item, value, paid: false }]);
  };

  const togglePaid = (index) => {
    const newCommitments = commitments.map((commitment, i) => 
      i === index ? { ...commitment, paid: !commitment.paid } : commitment
    );
    setCommitments(newCommitments);
  };

  const totalPaid = commitments.filter(c => c.paid).reduce((acc, c) => acc + c.value, 0);
  const totalUnpaid = commitments.filter(c => !c.paid).reduce((acc, c) => acc + c.value, 0);
  const remainingBalance = income - totalUnpaid;

  return (
    <div className="app">
      <h1>Spending Tracker</h1>
      <input
        type="number"
        value={income}
        onChange={(e) => setIncome(e.target.value)}
        placeholder="Enter your income"
      />
      <h2>Commitments</h2>
      <ul>
        {commitments.map((commitment, index) => (
          <li key={index}>
            <input type="checkbox" checked={commitment.paid} onChange={() => togglePaid(index)} />
            {commitment.item} - ${commitment.value}
          </li>
        ))}
      </ul>
      <h3>Total Unpaid: ${totalUnpaid}</h3>
      <h3>Total Paid: ${totalPaid}</h3>
      <h3>Remaining Balance: ${remainingBalance}</h3>
    </div>
  );
};

export default App;
User Guide
Setting Income: Input your monthly income at the top of the app.
Adding Commitments: Use the "Add Commitment" button to add new expenses.
Marking as Paid: Check the box next to a commitment to mark it as paid.
Viewing Stats: Check the summary section for total unpaid, total paid, and remaining balance.
Testing
Implement unit tests for core functionalities like sum calculations and data persistence.
Conclusion
This simple spending app provides a robust solution for tracking personal finances with an intuitive interface and essential features. By following the above structure and code snippets, you can create an efficient application that meets user needs.
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Spending App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        h1, h2, h3 {
            color: #333;
        }
        .app {
            max-width: 600px;
            margin: auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        input[type="number"], input[type="text"] {
            width: calc(100% - 20px);
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            padding: 10px 15px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            background-color: #218838;
        }
        ul {
            list-style-type: none;
            padding: 0;
        }
        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #ccc;
        }
    </style>
</head>
<body>

<div class="app">
    <h1>Spending Tracker</h1>
    <input type="text" id="questName" placeholder="Enter Quest Name" />
    <input type="number" id="incomeInput" placeholder="Enter your income" />
    <h2>Commitments</h2>
    <input type="text" id="commitmentName" placeholder="Commitment Name" />
    <input type="number" id="commitmentValue" placeholder="Commitment Value" />
    <button onclick="addCommitment()">Add Commitment</button>
    <button onclick="resetQuest()">Close Quest</button>
    
    <ul id="commitmentList"></ul>
    
    <h3 id="totalUnpaid">Total Unpaid: $0.00</h3>
    <h3 id="totalPaid">Total Paid: $0.00</h3>
    <h3 id="remainingBalance">Remaining Balance: $0.00</h3>
</div>

<script>
    let income = 0;
    const commitments = [];
    let questHistory = [];

    document.getElementById('incomeInput').addEventListener('change', function() {
        income = parseFloat(this.value) || 0;
        updateStats();
    });

    function addCommitment() {
        const name = document.getElementById('commitmentName').value.trim();
        const value = parseFloat(document.getElementById('commitmentValue').value) || 0;

        if (name && value > 0) {
            commitments.push({ name, value, paid: false });
            document.getElementById('commitmentName').value = '';
            document.getElementById('commitmentValue').value = '';
            renderCommitments();
            updateStats();
        }
    }

    function togglePaid(index) {
        commitments[index].paid = !commitments[index].paid;
        renderCommitments();
        updateStats();
    }

    function renderCommitments() {
        const list = document.getElementById('commitmentList');
        list.innerHTML = '';
        commitments.forEach((commitment, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${commitment.paid ? 'checked' : ''} onchange="togglePaid(${index})" />
                ${commitment.name} - $${commitment.value.toFixed(2)}
            `;
            list.appendChild(li);
        });
    }

    function updateStats() {
        const totalPaid = commitments.filter(c => c.paid).reduce((acc, c) => acc + c.value, 0);
        const totalUnpaid = commitments.filter(c => !c.paid).reduce((acc, c) => acc + c.value, 0);
        const remainingBalance = income - totalUnpaid;

        document.getElementById('totalPaid').innerText = `Total Paid: $${totalPaid.toFixed(2)}`;
        document.getElementById('totalUnpaid').innerText = `Total Unpaid: $${totalUnpaid.toFixed(2)}`;
        document.getElementById('remainingBalance').innerText = `Remaining Balance: $${remainingBalance.toFixed(2)}`;
    }

    function resetQuest() {
        const questName = document.getElementById('questName').value.trim();
        
        if (questName) {
            // Save current quest to archive
            questHistory.push({
                name: questName,
                commitments: [...commitments],
                income: income
            });
            commitments.length = 0; // Clear commitments
            document.getElementById('commitmentList').innerHTML = '';
            document.getElementById('incomeInput').value = ''; // Clear income input
            
            // Prompt for new income input
            const newIncome = prompt("Enter your new income:");
            income = parseFloat(newIncome) || 0; // Set new income
            document.getElementById('questName').value = ''; // Clear quest name
            updateStats(); // Update stats
            alert("Current quest has been archived. You can now start a new quest.");
        } else {
            alert("Please enter a quest name to archive.");
        }
    }
</script>

</body>
</html>

add New Features :
Quest Name Input: A text input at the top to enter the name of the quest.
Quest History: The current quest is saved with its name and commitments when closed, allowing for better tracking.
How to Use
Set Quest Name: Enter a name for your quest at the top.
Set Your Income: Enter your monthly income.
Add Commitments: Fill in the commitment name and value, then click "Add Commitment."
Mark as Paid: Check the box next to any commitment to mark it as paid.
Close Quest: Click the "Close Quest" button to archive your current quest and enter a new income when prompted.
View Stats: The total unpaid, total paid, and remaining balance will update automatically.
This update enhances the app's usability by allowing users to easily identify and manage their quests.
  