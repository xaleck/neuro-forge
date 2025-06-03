export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        user.cloudCredits = user.cloudCredits === undefined ? 0 : Number(user.cloudCredits);
        user.eloRating = user.eloRating === undefined ? 1000 : Number(user.eloRating);
        user.matchesPlayed = user.matchesPlayed === undefined ? 0 : Number(user.matchesPlayed);
        user.matchHistory = user.matchHistory === undefined ? [] : user.matchHistory; // Initialize matchHistory
        return user;
    }
    return null;
};

export const login = async (credentials) => {
    // ... existing code ...
    loggedInUser.cloudCredits = loggedInUser.cloudCredits === undefined ? 0 : Number(loggedInUser.cloudCredits);
    loggedInUser.eloRating = loggedInUser.eloRating === undefined ? 1000 : Number(loggedInUser.eloRating);
    loggedInUser.matchesPlayed = loggedInUser.matchesPlayed === undefined ? 0 : Number(loggedInUser.matchesPlayed);
    loggedInUser.matchHistory = loggedInUser.matchHistory === undefined ? [] : loggedInUser.matchHistory; // Initialize matchHistory

    localStorage.setItem('user', JSON.stringify(loggedInUser));
    // ... existing code ...
    export const saveUser = (userData) => {
        if (userData) {
            // Ensure numeric types before saving
            userData.cloudCredits = userData.cloudCredits === undefined ? 0 : Number(userData.cloudCredits);
            userData.eloRating = userData.eloRating === undefined ? 1000 : Number(userData.eloRating);
            userData.matchesPlayed = userData.matchesPlayed === undefined ? 0 : Number(userData.matchesPlayed);
            // Ensure matchHistory is an array (it should be if handled correctly elsewhere)
            userData.matchHistory = Array.isArray(userData.matchHistory) ? userData.matchHistory : [];

            localStorage.setItem('user', JSON.stringify(userData));
            console.log('User data saved to localStorage:', userData);
        } else {
            console.error('Attempted to save null or undefined user data');
        }
    }; 