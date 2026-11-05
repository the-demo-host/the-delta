# What's left to do

Each item describes the required outcome, not how to achieve it. Run `npm test` or open `/progress` to see which features are finished.

## Core app

- [x] Anyone can post a question from the main page.
- [x] A person can add a display name or post anonymously.
- [x] Posted questions appear in a list with their text, author, vote count and age.
- [x] Questions persist when the app restarts.

## Features

### Upvotes

- [ ] Clicking ▲ adds a vote to a question.
- [ ] Each person can vote only once per question.
- [ ] The vote count persists and is correct for everyone viewing the page.

### Sorting

- [ ] **Top** orders questions by most votes.
- [ ] **Newest** orders questions by most recent.

### Live updates

- [ ] New questions appear on every open page without a refresh.
- [ ] Vote changes appear on every open page without a refresh.
- [ ] Moderation changes appear on every open page without a refresh.

### Moderation

- [ ] The host can hide a question, and attendees no longer see it.
- [ ] The host can mark a question as answered, and attendees can see that it was.
- [ ] Only the host can moderate.

### Question age

- [ ] Each question shows an accurate age, such as "2 min ago", for viewers in any time zone.

### Search or tags (optional)

- [ ] Attendees can narrow the list to the questions they care about.

## Workshop support

- [ ] Attendees can reach the running app and do their work using only a browser.
- [x] Each required feature above has automated tests that define when it's done.
- [x] A progress page shows which features are done, in a form readable on a projector.
- [x] Sample questions are available, so the app doesn't start empty.
- [ ] The facilitator can reset the project to its starting state between sessions. Only the database can be reset so far, not the code.

## Open decisions

- [ ] Where do the code and the running app live?
- [ ] Which features do attendees complete, and which are finished before the session?
- [ ] How long is the session, and how many people are attending?
