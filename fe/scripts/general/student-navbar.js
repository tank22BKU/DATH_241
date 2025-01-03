function LogOutSTD() {

    const logoutTab = document.querySelector('.student-navbar-avatar .logout-tab');

    if (logoutTab) {
        logoutTab.addEventListener("click", () => {

            document.cookie = "token=";
            document.cookie = "id=";

            window.location.href = "./welcome.html";
        });
    } else {
        console.error("Logout tab not found. Check your HTML structure.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch('http://127.0.0.1:5500/fe/scripts/general/student-navbar.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('.student-navbar').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));

    const avatar = document.querySelector('.student-navbar-avatar .avatar');
    if (avatar) avatar.addEventListener("click", () => {
        avatar.parentElement.classList.toggle("active");
    });

    setupNotificationPopup(); // Ensure the function is called
    setupMessagePopup();
});

function setupNotificationPopup() {
    const notificationIcon = document.querySelector('.student-navbar-notification a');
    if (!notificationIcon) {
        console.error("Notification icon not found. Check your HTML structure.");
        return;
    }

    const notificationPopup = document.createElement('div');
    notificationPopup.classList.add('notification-popup');
    notificationPopup.style.position = 'absolute'; // Ensure the popup is positioned correctly
    notificationPopup.style.display = 'none'; // Initially hide the popup
    document.body.appendChild(notificationPopup);

    notificationIcon.addEventListener('click', async (event) => {
        event.preventDefault();
        notificationPopup.innerHTML = ''; // Clear previous notifications
        notificationPopup.style.display = 'block';

        try {
            const userID = parseInt(getCookie('id'));
            const token = getCookie('token');
            const response = await fetch(`http://localhost:3000/api/d1/users/${userID}/notifications`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "token": `Bearer ${token}`
                }
            });
            if (!response.ok) console.log("Failing Getting User by ID for create config!");
            const result = await response.json();

            if (result.status === 200) {
                result.data.forEach(notification => {
                    const notificationElement = document.createElement('div');
                    notificationElement.classList.add('notification-item');
                    notificationElement.innerHTML = `
                        <h4>${notification.detail.title}</h4>
                        <p>${notification.detail.content}</p>
                    `;
                    notificationPopup.appendChild(notificationElement);
                });
            } else {
                notificationPopup.innerHTML = '<p>No notifications found.</p>';
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            notificationPopup.innerHTML = '<p>Error fetching notifications.</p>';
        }
    });

    document.addEventListener('click', (event) => {
        if (!notificationPopup.contains(event.target) && !notificationIcon.contains(event.target)) {
            notificationPopup.style.display = 'none';
        }
    });
}

//message
// document.addEventListener('DOMContentLoaded', () => {
//     // Các chức năng khác của navbar
//     loadChatWidget(); // Tải khung chat
// });
function setupMessagePopup() {
    const messageIcon = document.querySelector('.student-header-chat a');
    if (!messageIcon) {
        console.error("Message icon not found. Check your HTML structure.");
        return;
    }

    const messagePopup = document.createElement('div');
    messagePopup.classList.add('message-popup');
    messagePopup.style.display = 'none';
    document.body.appendChild(messagePopup);

    messageIcon.addEventListener('click', (event) => {
        event.preventDefault();
        const iconRect = messageIcon.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        messagePopup.style.top = `${iconRect.bottom + scrollTop + 5}px`;
        messagePopup.style.left = `${iconRect.right - 300 + scrollLeft}px`;
        messagePopup.style.display = 'block';

        fetch('http://localhost:3000/api/d1/users?role=spso')
            .then(response => response.json())
            .then(data => {
                if (data.status === 200 && data.data.length) {
                    showAdminList(data.data);
                } else {
                    messagePopup.innerHTML = '<p>No Admins Found</p>';
                }
            })
            .catch(error => {
                console.error("Error fetching admins:", error);
                messagePopup.innerHTML = '<p>Error loading admins</p>';
            });
    });

    document.addEventListener('click', (event) => {
        if (!messagePopup.contains(event.target) && !messageIcon.contains(event.target)) {
            messagePopup.style.display = 'none';
        }
    });

    function showAdminList(admins) {
        messagePopup.innerHTML = '<h4>Select an Admin</h4>';
        admins.forEach(admin => {
            const adminElement = document.createElement('div');
            adminElement.classList.add('admin-item');
            adminElement.textContent = admin.name;

            adminElement.addEventListener('click', () => {
                showChatInterface(admin);
                messagePopup.style.display = 'none';
            });

            messagePopup.appendChild(adminElement);
        });
    }

    function showChatInterface(admin) {
        const chatPopup = document.createElement('div');
        chatPopup.classList.add('chat-popup');
        chatPopup.style.position = 'fixed';
        chatPopup.style.bottom = '0';
        chatPopup.style.right = '10px';
        document.body.appendChild(chatPopup);
        const studentID = parseInt(getCookie('id'));

        fetch(`http://localhost:3000/api/d1/messages?sender_id=${studentID}&receiver_id=${admin.user_ID}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 200) {
                    renderChatInterface(chatPopup, studentID, admin, data.data);
                } else {
                    chatPopup.innerHTML = '<p>Error loading chat messages</p>';
                }
            })
            .catch(error => {
                console.error("Error loading chat messages:", error);
                chatPopup.innerHTML = '<p>Error loading chat messages</p>';
            });
    }

    function renderChatInterface(chatPopup, sender_id, admin, messages) {
        fetch('http://127.0.0.1:5500/fe/scripts/general/chat-widget.html')
            .then(response => response.text())
            .then(htmlContent => {
                chatPopup.innerHTML = htmlContent;

                const chatHeader = chatPopup.querySelector('.chat-header span');
                const chatMessages = chatPopup.querySelector('.chat-messages');
                const chatInput = chatPopup.querySelector('.chat-input');
                const sendButton = chatPopup.querySelector('.send-message-button');
                //const minimizeButton = chatPopup.querySelector('.minimize-chat');
                const closeButton = chatPopup.querySelector('.close-chat');
                //const chatBody = chatPopup.querySelector('.chat-body');

                chatHeader.textContent = admin.name;

                // Hiển thị các tin nhắn ban đầu
                function displayMessages(messages) {
                    chatMessages.innerHTML = ''; // Xóa nội dung cũ
                    messages.forEach(msg => {
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message', msg.sender_id === sender_id ? 'user-message' : 'admin-message');
                        messageElement.innerHTML = `<p>${msg.content}</p><small>${msg.created_at}</small>`;
                        chatMessages.appendChild(messageElement);
                    });
                    chatMessages.scrollTop = chatMessages.scrollHeight; // Cuộn xuống cuối
                }
                displayMessages(messages);

                // Cập nhật tin nhắn định kỳ
                function updateChatMessages() {
                    fetch(`http://localhost:3000/api/d1/messages?sender_id=${sender_id}&receiver_id=${admin.user_ID}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 200) {
                                displayMessages(data.data);
                            }
                        })
                        .catch(error => console.error("Error updating messages:", error));
                }

                // Gửi tin nhắn
                sendButton.addEventListener('click', () => {
                    const content = chatInput.value.trim();
                    if (!content) return;

                    fetch(`http://localhost:3000/api/d1/messages/${sender_id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ receiver_id: admin.user_ID, content })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 201) {
                                updateChatMessages();
                                chatInput.value = '';
                            } else {
                                console.error("Error sending message:", data.message);
                            }
                        })
                        .catch(error => console.error("Error sending message:", error));
                });

                // Thu nhỏ/phóng to khung chat
                // let isMinimized = false;
                // minimizeButton.addEventListener('click', () => {
                //     if (isMinimized) {
                //         chatBody.style.display = 'block';
                //         chatMessages.scrollTop = chatMessages.scrollHeight; // Cuộn xuống cuối khi mở
                //         chatInput.focus(); // Lấy lại tiêu điểm vào khung nhập
                //         isMinimized = false;
                //     } else {
                //         chatBody.style.display = 'none';
                //         isMinimized = true;
                //     }
                // });

                // Đóng khung chat
                closeButton.addEventListener('click', () => {
                    chatPopup.remove();
                });

                updateChatMessages(); // Cập nhật ngay khi mở
                setInterval(updateChatMessages, 1000); // Cập nhật mỗi 5 giây
            })
            .catch(error => {
                console.error("Error loading chat widget:", error);
                chatPopup.innerHTML = '<p>Error loading chat interface</p>';
            });
    }

}









function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;  // If cookie not found
}