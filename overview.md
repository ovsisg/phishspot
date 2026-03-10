This system will be developed as a single-page application.
Only front-end behavior and logic are required.

No server-side backend or audio features will be implemented.

its a phishing game where users have to answer questions to get points.
we will use 2 buckets in supababase where the bucket will got the images that we will display in the game,   buckets will got the phishing and no phishing emails as images. 
and after each answer from user we will display this follow up questions to confirm if the user has strong unerstanding or not ( 3 options) (and there will be no points on this its just feedback and follow up questions)

so i mean with this will be for now 3 tables and 2 buckets in supababase :

1- users table (curenctly with 1 role should be admin)
2- questions table (should be linked to the users table and has all info for phishing and no phishing emails)
3- follow up questions table (should be linked to the questions table)
4- phishing emails bucket
5- no phishing emails bucket


Total questions per game: 10

Time per question: 30 seconds

Questions are shown one at a time

Score is calculated per correct answer

No page reloads during the game

UI Rules

Single page

Panels appear and disappear without page navigation

Timer Behaviour

Timer initial value is 30 seconds

Timer starts automatically when the question appears

Timer stops when the user selects an answer

Timer Colors

Green: more than 10 seconds remaining

Orange: 5 to 10 seconds remaining

Red: 5 to 0 seconds remaining




