// DOM Elements
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// User Database Simulation
const userDatabase = {
    users: [],
    
    // Default demo users
    init() {
        console.log('Initializing user database...');
        const savedUsers = localStorage.getItem('anonsenUserDatabase');
        console.log('Raw saved users data:', savedUsers);
        
        if (savedUsers) {
            try {
                this.users = JSON.parse(savedUsers);
                console.log('Loaded users from localStorage:', this.users.length, 'users');
                console.log('Users:', this.users.map(u => ({id: u.id, username: u.username, email: u.email})));
            } catch (error) {
                console.error('Error parsing saved users:', error);
                this.users = [];
                localStorage.removeItem('anonsenUserDatabase');
            }
        } 
        
        if (!this.users || this.users.length === 0) {
            console.log('No users found, creating demo users...');
            // Add some demo users
            this.users = [
                {
                    id: 1,
                    username: 'demo_user',
                    email: 'demo@anonsen.com',
                    password: 'demo123456',
                    profilePicture: null,
                    joinDate: new Date().toISOString(),
                    isVerified: true
                },
                {
                    id: 2,
                    username: 'test_user',
                    email: 'test@example.com',
                    password: 'test123456',
                    profilePicture: null,
                    joinDate: new Date().toISOString(),
                    isVerified: true
                }
            ];
            this.save();
        }
    },
    
    save() {
        try {
            localStorage.setItem('anonsenUserDatabase', JSON.stringify(this.users));
            console.log('User database saved successfully');
        } catch (error) {
            console.error('Error saving user database:', error);
            alert('Fehler beim Speichern der Benutzerdaten. Möglicherweise ist der Speicher voll.');
        }
    },
    
    findByEmail(email) {
        return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    },
    
    findByUsername(username) {
        return this.users.find(user => user.username.toLowerCase() === username.toLowerCase());
    },
    
    addUser(userData) {
        const newUser = {
            id: this.users.length + 1,
            ...userData,
            joinDate: new Date().toISOString(),
            isVerified: true,
            profilePicture: null
        };
        this.users.push(newUser);
        this.save();
        return newUser;
    },
    
    updateUser(userId, updates) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.save();
            return this.users[userIndex];
        }
        return null;
    },
    
    authenticateUser(emailOrUsername, password) {
        const user = this.findByEmail(emailOrUsername) || this.findByUsername(emailOrUsername);
        if (user && user.password === password) {
            return { ...user };
        }
        return null;
    }
};

// Posts Database
const postsDatabase = {
    posts: [],
    
    init() {
        console.log('Initializing posts database...');
        const savedPosts = localStorage.getItem('anonsenPostsDatabase');
        console.log('Raw saved posts data:', savedPosts);
        
        if (savedPosts) {
            try {
                this.posts = JSON.parse(savedPosts);
                console.log('Loaded posts from localStorage:', this.posts.length, 'posts');
            } catch (error) {
                console.error('Error parsing saved posts:', error);
                this.posts = [];
                localStorage.removeItem('anonsenPostsDatabase');
            }
        } else {
            console.log('No posts found, starting with empty array');
            this.posts = [];
            this.save();
        }
    },
    
    save() {
        try {
            localStorage.setItem('anonsenPostsDatabase', JSON.stringify(this.posts));
            console.log('Posts database saved successfully');
        } catch (error) {
            console.error('Error saving posts database:', error);
            alert('Fehler beim Speichern der Posts. Möglicherweise ist der Speicher voll.');
        }
    },
    
    addPost(postData) {
        const newPost = {
            id: Date.now(),
            ...postData,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            likedBy: [],
            isLiked: false
        };
        this.posts.unshift(newPost); // Add to beginning for newest first
        this.save();
        return newPost;
    },
    
    getAllPosts() {
        return [...this.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    toggleLike(postId, userId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const likedIndex = post.likedBy.indexOf(userId);
            if (likedIndex > -1) {
                post.likedBy.splice(likedIndex, 1);
                post.likes--;
            } else {
                post.likedBy.push(userId);
                post.likes++;
            }
            this.save();
            return post;
        }
        return null;
    }
};

// Auth Modal Elements
const authModal = document.getElementById('authModal');
const welcomeScreen = document.getElementById('welcomeScreen');
const registerScreen = document.getElementById('registerScreen');
const loginScreen = document.getElementById('loginScreen');
const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const laterBtn = document.getElementById('laterBtn');
const backFromRegister = document.getElementById('backFromRegister');
const backFromLogin = document.getElementById('backFromLogin');
const switchToRegister = document.getElementById('switchToRegister');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Sidebar Toggle Functionality
function toggleSidebar() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : 'auto';
}

function closeSidebarFn() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Event Listeners
menuBtn.addEventListener('click', toggleSidebar);
closeSidebar.addEventListener('click', closeSidebarFn);
sidebarOverlay.addEventListener('click', closeSidebarFn);

// Close sidebar on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebarFn();
    }
    if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
        closeAuthModal();
    }
});

// Authentication Modal Functions
function showAuthModal() {
    console.log('Showing auth modal...');
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Force mobile Safari to respect the modal
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = '0';
    }
}

function closeAuthModal() {
    console.log('Closing auth modal...');
    authModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset mobile Safari fixes
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
    }
    
    showWelcomeScreen();
}

function showWelcomeScreen() {
    welcomeScreen.classList.remove('hidden');
    registerScreen.classList.add('hidden');
    loginScreen.classList.add('hidden');
}

function showRegisterScreen() {
    welcomeScreen.classList.add('hidden');
    registerScreen.classList.remove('hidden');
    registerScreen.classList.add('slide-in-left');
    setTimeout(() => registerScreen.classList.remove('slide-in-left'), 300);
    loginScreen.classList.add('hidden');
}

function showLoginScreen() {
    welcomeScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    loginScreen.classList.add('slide-in-left');
    setTimeout(() => loginScreen.classList.remove('slide-in-left'), 300);
    registerScreen.classList.add('hidden');
}

function switchToRegisterFromLogin() {
    loginScreen.classList.add('hidden');
    registerScreen.classList.remove('hidden');
    registerScreen.classList.add('slide-in-right');
    setTimeout(() => registerScreen.classList.remove('slide-in-right'), 300);
}

// Authentication Event Listeners
registerBtn.addEventListener('click', showRegisterScreen);
loginBtn.addEventListener('click', showLoginScreen);
laterBtn.addEventListener('click', closeAuthModal);
backFromRegister.addEventListener('click', showWelcomeScreen);
backFromLogin.addEventListener('click', showWelcomeScreen);
switchToRegister.addEventListener('click', switchToRegisterFromLogin);

// Close modal when clicking outside
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        closeAuthModal();
    }
});

// Form Validation and Submission
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function validateUsername(username) {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

// Registration Form Handler
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!validateUsername(username)) {
        showNotification('Benutzername muss mindestens 3 Zeichen lang sein und darf nur Buchstaben, Zahlen und _ enthalten', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Bitte geben Sie eine gültige E-Mail-Adresse ein', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showNotification('Passwort muss mindestens 8 Zeichen lang sein', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwörter stimmen nicht überein', 'error');
        return;
    }
    
    // Check if user already exists
    if (userDatabase.findByEmail(email)) {
        showNotification('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits', 'error');
        return;
    }
    
    if (userDatabase.findByUsername(username)) {
        showNotification('Dieser Benutzername ist bereits vergeben', 'error');
        return;
    }
    
    // Register new user
    const submitBtn = registerForm.querySelector('.auth-btn.primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Wird erstellt...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        try {
            const newUser = userDatabase.addUser({
                username: username,
                email: email,
                password: password
            });
            
            showNotification('Konto erfolgreich erstellt! Willkommen bei Anonsen!', 'success');
            
            // Set current user session (always remember new registrations)
            sessionManager.setSession(newUser, true);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            closeAuthModal();
            updateUIForLoggedInUser(newUser);
        } catch (error) {
            showNotification('Fehler bei der Registrierung. Bitte versuchen Sie es erneut.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1500);
});

// Login Form Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    
    const usernameOrEmail = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    console.log('Login attempt with:', usernameOrEmail, 'Remember me:', rememberMe);
    console.log('Available users:', userDatabase.users.map(u => ({username: u.username, email: u.email})));
    
    if (!usernameOrEmail || !password) {
        showNotification('Bitte füllen Sie alle Felder aus', 'error');
        return;
    }
    
    // Authenticate user
    const submitBtn = loginForm.querySelector('.auth-btn.primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Wird angemeldet...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const user = userDatabase.authenticateUser(usernameOrEmail, password);
        
        if (user) {
            showNotification('Erfolgreich angemeldet! Willkommen zurück!', 'success');
            
            // Set current user session using sessionManager
            sessionManager.setSession(user, rememberMe);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            closeAuthModal();
            updateUIForLoggedInUser(user);
        } else {
            showNotification('Ungültige E-Mail/Benutzername oder Passwort', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1000);
});

// Social Login Handlers
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = btn.classList.contains('google') ? 'Google' : 'Apple';
        
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
            showNotification(`${provider} Login wird in der Vollversion verfügbar sein`, 'info');
        }, 150);
    });
});

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    const userObj = typeof user === 'string' ? { username: user, profilePicture: null } : user;
    
    // Update profile button with picture or default
    const headerAvatar = document.getElementById('headerAvatar');
    if (userObj.profilePicture) {
        headerAvatar.style.backgroundImage = `url(${userObj.profilePicture})`;
        headerAvatar.style.backgroundSize = 'cover';
        headerAvatar.style.backgroundPosition = 'center';
        headerAvatar.innerHTML = '';
    } else {
        headerAvatar.style.background = 'var(--accent-primary)';
        headerAvatar.style.backgroundImage = 'none';
        headerAvatar.innerHTML = `<i class="fas fa-user" style="color: white; font-size: 0.8rem;"></i>`;
    }
    
    // Store current user globally
    window.currentUser = userObj;
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : 'var(--accent-primary)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 11000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;
        max-width: 350px;
    `;
    
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Session Management
const sessionManager = {
    setSession(user, rememberMe = false) {
        const sessionData = {
            id: user.id,
            username: user.username,
            email: user.email,
            isLoggedIn: true,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe,
            expiresAt: rememberMe ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours if not remember me
        };
        
        console.log('Setting session:', sessionData);
        
        try {
            // Always use localStorage for persistence
            localStorage.setItem('anonsenCurrentUser', JSON.stringify(sessionData));
            console.log('Session saved to localStorage');
        } catch (error) {
            console.error('Error saving session to localStorage:', error);
        }
        
        try {
            // Also set in sessionStorage for backup
            sessionStorage.setItem('anonsenCurrentUser', JSON.stringify(sessionData));
            console.log('Session saved to sessionStorage');
        } catch (error) {
            console.error('Error saving session to sessionStorage:', error);
        }
    },
    
    getSession() {
        // Try localStorage first (persistent)
        let sessionData = localStorage.getItem('anonsenCurrentUser');
        
        // Fallback to sessionStorage
        if (!sessionData) {
            sessionData = sessionStorage.getItem('anonsenCurrentUser');
        }
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                
                // Check if session is expired (only for non-remember sessions)
                if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
                    this.clearSession();
                    return null;
                }
                
                return session;
            } catch (error) {
                console.error('Error parsing session data:', error);
                this.clearSession();
                return null;
            }
        }
        
        return null;
    },
    
    clearSession() {
        localStorage.removeItem('anonsenCurrentUser');
        sessionStorage.removeItem('anonsenCurrentUser');
    },
    
    isLoggedIn() {
        const session = this.getSession();
        return session && session.isLoggedIn;
    }
};

// Check if user is already logged in on page load
function checkAuthStatus() {
    console.log('Checking auth status...');
    const session = sessionManager.getSession();
    console.log('Session found:', session);
    
    if (session && session.isLoggedIn) {
        // Get full user data from database
        const fullUser = userDatabase.users.find(u => u.id === session.id);
        console.log('Full user found:', fullUser);
        
        if (fullUser) {
            updateUIForLoggedInUser(fullUser);
            return true;
        } else {
            console.log('User not found in database, clearing session');
            // User not found in database, clear session
            sessionManager.clearSession();
        }
    }
    console.log('No valid session found');
    return false;
}

// Profile Management Functions
function showProfileModal() {
    const profileModal = document.getElementById('profileModal');
    profileModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Load current user data
    if (window.currentUser) {
        document.getElementById('profileUsername').value = window.currentUser.username;
        document.getElementById('profileEmail').value = window.currentUser.email;
        document.getElementById('profileBio').value = window.currentUser.bio || '';
        
        // Update profile picture
        updateProfilePicture(window.currentUser.profilePicture);
    }
}

function closeProfileModal() {
    const profileModal = document.getElementById('profileModal');
    profileModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function updateProfilePicture(pictureUrl) {
    const profilePicture = document.getElementById('profilePicture');
    const profilePicturePlaceholder = document.getElementById('profilePicturePlaceholder');
    const removePictureBtn = document.getElementById('removePictureBtn');
    
    if (pictureUrl) {
        profilePicture.src = pictureUrl;
        profilePicture.classList.remove('hidden');
        profilePicturePlaceholder.classList.add('hidden');
        removePictureBtn.style.display = 'flex';
    } else {
        profilePicture.classList.add('hidden');
        profilePicturePlaceholder.classList.remove('hidden');
        removePictureBtn.style.display = 'none';
    }
}

function handleProfilePictureUpload(file) {
    if (file && file.type.startsWith('image/')) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Bild ist zu groß. Maximale Dateigröße: 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            updateProfilePicture(imageUrl);
            
            // Update current user data
            if (window.currentUser) {
                window.currentUser.profilePicture = imageUrl;
            }
        };
        reader.readAsDataURL(file);
    } else {
        showNotification('Bitte wählen Sie eine gültige Bilddatei aus', 'error');
    }
}

function saveProfile() {
    if (!window.currentUser) {
        showNotification('Kein Benutzer angemeldet', 'error');
        return;
    }
    
    const bio = document.getElementById('profileBio').value.trim();
    const profilePicture = window.currentUser.profilePicture;
    
    // Update user in database
    const updatedUser = userDatabase.updateUser(window.currentUser.id, {
        bio: bio,
        profilePicture: profilePicture
    });
    
    if (updatedUser) {
        window.currentUser = updatedUser;
        updateUIForLoggedInUser(updatedUser);
        showNotification('Profil erfolgreich gespeichert!', 'success');
        closeProfileModal();
    } else {
        showNotification('Fehler beim Speichern des Profils', 'error');
    }
}

function logout() {
    sessionManager.clearSession();
    window.currentUser = null;
    showNotification('Erfolgreich abgemeldet', 'success');
    closeProfileModal();
    
    // Reset UI
    const headerAvatar = document.getElementById('headerAvatar');
    headerAvatar.style.background = 'var(--accent-primary)';
    headerAvatar.style.backgroundImage = 'none';
    headerAvatar.innerHTML = '';
    
    // Show auth modal after logout
    setTimeout(() => {
        showAuthModal();
    }, 1500);
}

// Create Post Functions
let currentPostData = {
    image: null,
    caption: '',
    location: '',
    allowComments: true,
    allowLikes: true,
    isTextOnly: false
};

function showCreatePostModal() {
    if (!window.currentUser) {
        showNotification('Bitte melden Sie sich an, um einen Beitrag zu erstellen', 'error');
        return;
    }
    
    const createPostModal = document.getElementById('createPostModal');
    createPostModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Reset to step 1
    resetCreatePostModal();
}

function closeCreatePostModal() {
    const createPostModal = document.getElementById('createPostModal');
    createPostModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset form
    resetCreatePostModal();
    currentPostData = {
        image: null,
        caption: '',
        location: '',
        allowComments: true,
        allowLikes: true,
        isTextOnly: false
    };
}

function resetCreatePostModal() {
    document.getElementById('selectImageStep').classList.remove('hidden');
    document.getElementById('editPostStep').classList.add('hidden');
    document.getElementById('backCreatePost').style.display = 'none';
    
    // Clear form
    document.getElementById('postCaption').value = '';
    document.getElementById('postLocation').value = '';
    document.getElementById('allowComments').checked = true;
    document.getElementById('allowLikes').checked = true;
    document.getElementById('captionCount').textContent = '0';
    document.getElementById('postImagePreview').innerHTML = '';
}

function goToEditStep(isTextOnly = false) {
    document.getElementById('selectImageStep').classList.add('hidden');
    document.getElementById('editPostStep').classList.remove('hidden');
    document.getElementById('backCreatePost').style.display = 'block';
    
    // Update header title
    document.querySelector('.create-post-header h2').textContent = isTextOnly ? 'Text-Beitrag erstellen' : 'Beitrag bearbeiten';
    
    // Setup user info
    const userAvatar = document.getElementById('createPostUserAvatar');
    const username = document.getElementById('createPostUsername');
    
    if (window.currentUser) {
        if (window.currentUser.profilePicture) {
            userAvatar.style.backgroundImage = `url(${window.currentUser.profilePicture})`;
            userAvatar.style.backgroundSize = 'cover';
            userAvatar.innerHTML = '';
        } else {
            userAvatar.style.background = 'var(--accent-primary)';
            userAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }
        username.textContent = window.currentUser.username;
    }
    
    // Setup preview
    const preview = document.getElementById('postImagePreview');
    if (isTextOnly) {
        preview.className = 'post-image-preview text-only';
        preview.innerHTML = '<div>📝 Text-Beitrag</div>';
        currentPostData.isTextOnly = true;
    } else if (currentPostData.image) {
        preview.className = 'post-image-preview';
        preview.innerHTML = `<img src="${currentPostData.image}" alt="Post preview">`;
    }
}

function handleImageUpload(file) {
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showNotification('Bitte wählen Sie eine gültige Bilddatei aus', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('Bild ist zu groß. Maximale Dateigröße: 10MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentPostData.image = e.target.result;
        currentPostData.isTextOnly = false;
        goToEditStep(false);
    };
    reader.readAsDataURL(file);
}

function createPost() {
    if (!window.currentUser) {
        showNotification('Bitte melden Sie sich an', 'error');
        return;
    }
    
    const caption = document.getElementById('postCaption').value.trim();
    const location = document.getElementById('postLocation').value.trim();
    const allowComments = document.getElementById('allowComments').checked;
    const allowLikes = document.getElementById('allowLikes').checked;
    
    // Validate
    if (!caption && !currentPostData.image) {
        showNotification('Bitte fügen Sie Text oder ein Bild hinzu', 'error');
        return;
    }
    
    // Create post data
    const postData = {
        userId: window.currentUser.id,
        username: window.currentUser.username,
        userAvatar: window.currentUser.profilePicture,
        caption: caption,
        image: currentPostData.image,
        location: location,
        allowComments: allowComments,
        allowLikes: allowLikes,
        isTextOnly: currentPostData.isTextOnly
    };
    
    // Show loading
    const publishBtn = document.getElementById('publishPost');
    const originalText = publishBtn.innerHTML;
    publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird veröffentlicht...';
    publishBtn.disabled = true;
    
    setTimeout(() => {
        try {
            const newPost = postsDatabase.addPost(postData);
            showNotification('Beitrag erfolgreich veröffentlicht!', 'success');
            
            // Add to feed
            addPostToFeed(newPost, true); // true for prepend (newest first)
            
            publishBtn.innerHTML = originalText;
            publishBtn.disabled = false;
            closeCreatePostModal();
        } catch (error) {
            showNotification('Fehler beim Veröffentlichen des Beitrags', 'error');
            publishBtn.innerHTML = originalText;
            publishBtn.disabled = false;
        }
    }, 1500);
}

function addPostToFeed(post, prepend = false) {
    const feed = document.querySelector('.feed');
    const postElement = createPostElement(post);
    
    if (prepend) {
        feed.insertBefore(postElement, feed.firstChild);
    } else {
        feed.appendChild(postElement);
    }
    
    // Add event listeners for new post
    setupPostInteractions(postElement, post);
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post';
    article.setAttribute('data-post-id', post.id);
    
    // Calculate time ago
    const timeAgo = getTimeAgo(post.createdAt);
    
    // Create avatar HTML
    let avatarHTML;
    if (post.userAvatar) {
        avatarHTML = `<div class="post-avatar" style="background-image: url(${post.userAvatar}); background-size: cover; background-position: center;"></div>`;
    } else {
        avatarHTML = `<div class="post-avatar" style="background: var(--accent-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.9rem;"><i class="fas fa-user"></i></div>`;
    }
    
    article.innerHTML = `
        <div class="post-header">
            ${avatarHTML}
            <div class="post-info">
                <h3>${post.username}</h3>
                <span>${timeAgo}</span>
                ${post.location ? `<div class="post-location"><i class="fas fa-map-marker-alt"></i> ${post.location}</div>` : ''}
            </div>
            <button class="post-options">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
        
        ${post.image && !post.isTextOnly ? `
        <div class="post-image">
            <img src="${post.image}" alt="Post image" style="width: 100%; height: auto; border-radius: 8px;">
        </div>
        ` : ''}
        
        ${post.caption ? `
        <div class="post-content">
            <p>${post.caption}</p>
        </div>
        ` : ''}
        
        <div class="post-actions">
            <button class="action-btn like-btn" data-post-id="${post.id}">
                <i class="far fa-heart"></i>
                <span>${post.likes}</span>
            </button>
            <button class="action-btn comment-btn" data-post-id="${post.id}">
                <i class="far fa-comment"></i>
                <span>${post.comments}</span>
            </button>
            <button class="action-btn share-btn">
                <i class="far fa-paper-plane"></i>
            </button>
            <button class="action-btn save-btn">
                <i class="far fa-bookmark"></i>
            </button>
        </div>
    `;
    
    return article;
}

function setupPostInteractions(postElement, post) {
    const likeBtn = postElement.querySelector('.like-btn');
    const saveBtn = postElement.querySelector('.save-btn');
    
    // Like functionality
    likeBtn.addEventListener('click', function() {
        if (!window.currentUser) {
            showNotification('Bitte melden Sie sich an', 'error');
            return;
        }
        
        const updatedPost = postsDatabase.toggleLike(post.id, window.currentUser.id);
        if (updatedPost) {
            const icon = this.querySelector('i');
            const countSpan = this.querySelector('span');
            
            if (updatedPost.likedBy.includes(window.currentUser.id)) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#1e26fc';
                this.style.color = '#1e26fc';
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                this.style.color = '';
            }
            
            countSpan.textContent = updatedPost.likes;
        }
    });
    
    // Save functionality
    saveBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.style.color = '#1e26fc';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.style.color = '';
        }
    });
}

function getTimeAgo(dateString) {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min.`;
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)} Std.`;
    return `vor ${Math.floor(diffInMinutes / 1440)} Tag${Math.floor(diffInMinutes / 1440) > 1 ? 'en' : ''}`;
}

function loadExistingPosts() {
    const posts = postsDatabase.getAllPosts();
    
    posts.forEach(post => {
        addPostToFeed(post, false);
    });
}

// Post interactions
// Check localStorage availability
function isLocalStorageAvailable() {
    try {
        const test = 'anonsen-storage-test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.error('localStorage is not available:', e);
        return false;
    }
}

// Debug localStorage function
function debugLocalStorage() {
    console.log('=== LocalStorage Debug ===');
    console.log('localStorage available:', isLocalStorageAvailable());
    console.log('localStorage.length:', localStorage.length);
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value ? value.substring(0, 100) + (value.length > 100 ? '...' : '') : 'null');
    }
    console.log('=========================');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing Anonsen...');
    console.log('User-Agent:', navigator.userAgent);
    console.log('URL:', window.location.href);
    
    // Debug localStorage before initialization
    debugLocalStorage();
    
    // Initialize databases
    userDatabase.init();
    postsDatabase.init();
    console.log('Databases initialized');
    
    // Add mobile-specific touches
    if ('ontouchstart' in window) {
        console.log('Touch device detected');
        document.body.classList.add('touch-device');
    }
    
    // Check auth status and show modal if not logged in
    const authStatus = checkAuthStatus();
    console.log('Auth status:', authStatus);
    
    if (!authStatus) {
        setTimeout(() => {
            showAuthModal();
        }, 1000); // Show after 1 second for better UX
    } else {
        // Load existing posts
        loadExistingPosts();
        console.log('Loaded existing posts');
    }
    
    // Create Post Modal Event Listeners - with touch support
    const createPostBtns = [
        document.querySelector('.create-post-btn'),
        document.querySelector('.header-right .icon-btn:first-child')
    ];
    
    createPostBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', showCreatePostModal);
            // Add touch events for mobile
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.transform = 'scale(0.95)';
            });
            btn.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.style.transform = 'scale(1)';
                setTimeout(() => showCreatePostModal(), 50);
            });
        }
    });
    document.getElementById('closeCreatePostModal').addEventListener('click', closeCreatePostModal);
    
    // Image upload
    const imageUploadArea = document.getElementById('imageUploadArea');
    const postImageInput = document.getElementById('postImageInput');
    
    document.getElementById('selectImageBtn').addEventListener('click', () => {
        postImageInput.click();
    });
    
    postImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });
    
    // Drag and drop
    imageUploadArea.addEventListener('click', () => {
        postImageInput.click();
    });
    
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.classList.add('dragover');
    });
    
    imageUploadArea.addEventListener('dragleave', () => {
        imageUploadArea.classList.remove('dragover');
    });
    
    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });
    
    // Text-only post
    document.getElementById('textOnlyPostBtn').addEventListener('click', () => {
        currentPostData.isTextOnly = true;
        goToEditStep(true);
    });
    
    // Back button
    document.getElementById('backCreatePost').addEventListener('click', () => {
        document.getElementById('editPostStep').classList.add('hidden');
        document.getElementById('selectImageStep').classList.remove('hidden');
        document.getElementById('backCreatePost').style.display = 'none';
        document.querySelector('.create-post-header h2').textContent = 'Neuen Beitrag erstellen';
    });
    
    // Caption counter
    document.getElementById('postCaption').addEventListener('input', (e) => {
        const count = e.target.value.length;
        document.getElementById('captionCount').textContent = count;
        
        if (count > 450) {
            document.getElementById('captionCount').style.color = '#ef4444';
        } else {
            document.getElementById('captionCount').style.color = 'var(--text-muted)';
        }
    });
    
    // Publish post
    document.getElementById('publishPost').addEventListener('click', createPost);
    document.getElementById('cancelPost').addEventListener('click', closeCreatePostModal);
    
    // Close modal when clicking outside
    document.getElementById('createPostModal').addEventListener('click', (e) => {
        if (e.target.id === 'createPostModal') {
            closeCreatePostModal();
        }
    });
    
    // Profile modal event listeners
    document.getElementById('profileBtn').addEventListener('click', showProfileModal);
    document.getElementById('profileNavLink').addEventListener('click', (e) => {
        e.preventDefault();
        showProfileModal();
        if (window.innerWidth <= 768) {
            closeSidebarFn();
        }
    });
    document.getElementById('closeProfileModal').addEventListener('click', closeProfileModal);
    
    // Profile picture upload
    document.getElementById('uploadPictureBtn').addEventListener('click', () => {
        document.getElementById('profilePictureInput').click();
    });
    
    document.getElementById('profilePictureInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleProfilePictureUpload(file);
        }
    });
    
    document.getElementById('removePictureBtn').addEventListener('click', () => {
        updateProfilePicture(null);
        if (window.currentUser) {
            window.currentUser.profilePicture = null;
        }
        document.getElementById('profilePictureInput').value = '';
    });
    
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Close profile modal when clicking outside
    document.getElementById('profileModal').addEventListener('click', (e) => {
        if (e.target.id === 'profileModal') {
            closeProfileModal();
        }
    });
    // Like button functionality
    const likeButtons = document.querySelectorAll('.action-btn:first-child');
    likeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const countSpan = this.querySelector('span');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#1e26fc';
                this.style.color = '#1e26fc';
                
                // Increment count
                let count = parseInt(countSpan.textContent);
                countSpan.textContent = count + 1;
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                this.style.color = '';
                
                // Decrement count
                let count = parseInt(countSpan.textContent);
                countSpan.textContent = count - 1;
            }
        });
    });

    // Save button functionality
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.style.color = '#1e26fc';
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.style.color = '';
            }
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    searchInput.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });

    // Smooth scroll for nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 768) {
                closeSidebarFn();
            }
        });
    });

    // Story click functionality
    const stories = document.querySelectorAll('.story');
    stories.forEach(story => {
        story.addEventListener('click', function() {
            // Add a subtle animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Infinite scroll simulation
    let isLoading = false;
    
    function loadMorePosts() {
        if (isLoading) return;
        isLoading = true;
        
        // Simulate loading delay
        setTimeout(() => {
            const feed = document.querySelector('.feed');
            const newPost = createNewPost();
            feed.appendChild(newPost);
            isLoading = false;
        }, 1000);
    }

    function createNewPost() {
        const post = document.createElement('article');
        post.className = 'post';
        
        const usernames = ['shadow_walker', 'void_speaker', 'cipher_soul', 'echo_mind', 'ghost_writer'];
        const contents = [
            'In der Stille zwischen den Worten finden wir die tiefsten Wahrheiten. 🌌',
            'Anonym bedeutet nicht unsichtbar. Es bedeutet frei. ✨',
            'Hinter jeder Maske wartet eine Geschichte darauf, erzählt zu werden.',
            'Manchmal finden die ehrlichsten Gespräche im Dunkeln statt.',
            'Wir sind alle Fremde, bis wir uns entscheiden, es nicht zu sein. 🎭'
        ];
        
        const username = usernames[Math.floor(Math.random() * usernames.length)];
        const content = contents[Math.floor(Math.random() * contents.length)];
        const likes = Math.floor(Math.random() * 500) + 10;
        const comments = Math.floor(Math.random() * 50) + 1;
        
        post.innerHTML = `
            <div class="post-header">
                <div class="post-avatar"></div>
                <div class="post-info">
                    <h3>${username}</h3>
                    <span>vor ${Math.floor(Math.random() * 12) + 1} Stunden</span>
                </div>
                <button class="post-options">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            
            <div class="post-content">
                <p>${content}</p>
            </div>
            
            <div class="post-actions">
                <button class="action-btn">
                    <i class="far fa-heart"></i>
                    <span>${likes}</span>
                </button>
                <button class="action-btn">
                    <i class="far fa-comment"></i>
                    <span>${comments}</span>
                </button>
                <button class="action-btn">
                    <i class="far fa-paper-plane"></i>
                </button>
                <button class="action-btn save-btn">
                    <i class="far fa-bookmark"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to new post
        const likeBtn = post.querySelector('.action-btn:first-child');
        likeBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const countSpan = this.querySelector('span');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#1e26fc';
                this.style.color = '#1e26fc';
                
                let count = parseInt(countSpan.textContent);
                countSpan.textContent = count + 1;
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                this.style.color = '';
                
                let count = parseInt(countSpan.textContent);
                countSpan.textContent = count - 1;
            }
        });
        
        const saveBtn = post.querySelector('.save-btn');
        saveBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.style.color = '#1e26fc';
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.style.color = '';
            }
        });
        
        return post;
    }

    // Infinite scroll detection
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
            loadMorePosts();
        }
    });

    // Create post button functionality
    const createPostBtn = document.querySelector('.create-post-btn');
    createPostBtn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
            // Here you would open a create post modal
            console.log('Beitrag erstellen Modal würde hier geöffnet');
        }, 150);
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
        closeSidebarFn();
    }
});
