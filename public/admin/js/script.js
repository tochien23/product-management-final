//Button status

const buttonsStatus = document.querySelectorAll("[button-status]");

if (buttonsStatus.length > 0) {
    let url = new URL(window.location.href);
    buttonsStatus.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status");

            if (status) {
                url.searchParams.set("status", status);
            } else {
                url.searchParams.delete("status");
            }
            window.location.href = url.href;
        });
    });
}
//End Button Status

// Form Search
const formSearch = document.querySelector("#form-search");
if (formSearch) {
    let url = new URL(window.location.href);
    formSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        const keyword = e.target.elements.keyword.value;
        if (keyword) {
            url.searchParams.set("keyword", keyword);
        } else {
            url.searchParams.delete("keyword");
        }

        window.location.href = url.href;
    });
}
// End Form Search

//Pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]");
if (buttonsPagination) {
    //Set url cho page
    let url = new URL(window.location.href);
    buttonsPagination.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("button-pagination");
            url.searchParams.set("page", page);
            //Chuyển hướng trang
            window.location.href = url.href;
        });
    });
}
//End Pagination

// Checkbox Multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {
    const inputCheckAll = checkboxMulti.querySelector("input[name = 'checkall']");
    const inputsId = checkboxMulti.querySelectorAll("input[name='id']");

    inputCheckAll.addEventListener("click", () => {
        if (inputCheckAll.checked) {
            inputsId.forEach(input => {
                input.checked = true;
            });
        } else {
            inputsId.forEach(input => {
                input.checked = false;
            });
        }
    });

    //Tích từng checkbox
    inputsId.forEach(input => {
        input.addEventListener("click", () => {
            const countChecked = checkboxMulti.querySelectorAll("input[name='id']:checked").length;
            if (countChecked == inputsId.length) {
                inputCheckAll.checked = true;
            } else {
                inputCheckAll.checked = false;
            }
        });
    });
}
//End Checkbox Multi

// Form Change Multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if (formChangeMulti) {
    formChangeMulti.addEventListener("submit", (e) => {
        e.preventDefault();//Ngăn chặn hành vi load lại trang

        const checkboxMulti = document.querySelector("[checkbox-multi]");
        const inputsChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");

        const typeChange = e.target.elements.type.value;

        if (typeChange == "delete-all") {
            const isConfirm = confirm("Bạn có chắc muốn xóa những sản phẩm này?");

            if (!isConfirm) {
                return;
            }
        }
        //Xử lí logic
        if (inputsChecked.length > 0) {
            let ids = [];
            const inputIds = formChangeMulti.querySelector("input[name='ids']")

            inputsChecked.forEach(input => {
                const id = input.value;

                if (typeChange == "change-position") {
                    const position = input
                        .closest("tr")
                        .querySelector("input[name='position']").value;
                    ids.push(`${id}-${position}`);
                }
                else {
                    ids.push(id);
                }
            });
            inputIds.value = ids.join(", ");
            formChangeMulti.submit();
        } else {
            alert("Vui lòng chọn ít nhất 1 bản ghi");
        }
    });
}
//End Form Change Multi

// Modern Alert System - Fixed Version
const allAlerts = document.querySelectorAll("[show-alert]");

// Enhanced hide alert function
function hideAlert(alertElement) {
    if (alertElement) {
        alertElement.classList.add("alert-hidden");
        
        // Remove element from DOM after animation completes
        setTimeout(() => {
            if (alertElement && alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
        }, 500); // Increased timeout to match animation
    }
}

// Process each alert individually
allAlerts.forEach((showAlert, index) => {
    if (!showAlert) return;
    
    const time = parseInt(showAlert.getAttribute("data-time")) || 5000;
    const closeAlert = showAlert.querySelector("[close-alert]");
    let autoHideTimer = null;
    let isPaused = false;
    let timeRemaining = time;
    let startTime = Date.now();

    // Stagger multiple alerts
    if (allAlerts.length > 1) {
        showAlert.style.top = `calc(var(--admin-header-height) + ${1 + (index * 5)}rem)`;
    }

    // Start auto-hide timer
    function startTimer() {
        if (autoHideTimer) {
            clearTimeout(autoHideTimer);
        }
        
        autoHideTimer = setTimeout(() => {
            hideAlert(showAlert);
        }, timeRemaining);
        
        startTime = Date.now();
        isPaused = false;
    }

    // Pause timer
    function pauseTimer() {
        if (autoHideTimer && !isPaused) {
            clearTimeout(autoHideTimer);
            timeRemaining = Math.max(0, timeRemaining - (Date.now() - startTime));
            isPaused = true;
        }
    }

    // Manual close functionality
    if (closeAlert) {
        closeAlert.addEventListener("click", () => {
            if (autoHideTimer) {
                clearTimeout(autoHideTimer);
            }
            hideAlert(showAlert);
        });
    }

    // Add progress bar animation for modern alerts
    if (showAlert.classList.contains('modern-alert') && time > 0) {
        const progressBar = document.createElement('div');
        progressBar.className = 'alert-progress-bar';
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 0 0 0.75rem 0.75rem;
            animation: alertProgress linear ${time}ms;
            transform-origin: left center;
            width: 100%;
        `;
        showAlert.appendChild(progressBar);

        // Pause progress bar on hover
        showAlert.addEventListener('mouseenter', () => {
            progressBar.style.animationPlayState = 'paused';
            pauseTimer();
        });

        // Resume progress bar on mouse leave
        showAlert.addEventListener('mouseleave', () => {
            progressBar.style.animationPlayState = 'running';
            if (timeRemaining > 0) {
                // Update animation duration to remaining time
                progressBar.style.animation = `alertProgress linear ${timeRemaining}ms`;
                startTimer();
            }
        });
    } else {
        // For non-modern alerts, still handle hover pause
        showAlert.addEventListener('mouseenter', () => {
            pauseTimer();
        });

        showAlert.addEventListener('mouseleave', () => {
            if (timeRemaining > 0) {
                startTimer();
            }
        });
    }

    // Start the initial timer
    startTimer();
});
// End Modern Alert System


// Upload Image
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
    const uploadImageInput = document.querySelector("[upload-image-input]");
    const uploadImagePreview = document.querySelector("[upload-image-preview]");

    uploadImageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadImagePreview.src = URL.createObjectURL(file);
        }
    });
}
// End Upload Image

//Sort
const sort = document.querySelector("[sort]");
if (sort) {
    let url = new URL(window.location.href);

    const sortSelect = sort.querySelector("[sort-select]");
    const sortClear = sort.querySelector("[sort-clear]");
    // Sắp xếp 
    sortSelect.addEventListener("change", (e) => {
        const value = e.target.value;
        //Phá vỡ cấu trúc(Destructring)
        const [sortKey, sortValue] = (value.split("-"));
        //Gán url 
        url.searchParams.set("sortKey", sortKey);
        url.searchParams.set("sortValue", sortValue);

        window.location.href = url.href;//Load lại page
    }); 
    
    //Xóa sắp xếp
    sortClear.addEventListener("click", () => {
        url.searchParams.delete("sortKey");
        url.searchParams.delete("sortValue");

        window.location.href = url.href;//Load lại
    })

    //Thêm selected choc option
    const sortKey = url.searchParams.get("sortKey");
    const sortValue = url.searchParams.get("sortValue");

    if (sortKey && sortValue) {
        const stringSort = `${sortKey}-${sortValue}`;
        const optionSelected = sortSelect.querySelector(`option[value='${stringSort}']`);
        optionSelected.selected = true;
    }
}
//End Sort

// Admin Sidebar Toggle
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const mainContent = document.querySelector('.admin-main');
    
    // Restore sidebar state on load
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed && window.innerWidth > 1024) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('expanded');
        }
    }

    // Active menu highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.admin-nav .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.split('/').pop())) {
            link.classList.add('active');
        }
    });

    // Mobile sidebar toggle
    function toggleMobileSidebar() {
        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('show');
        } else {
            // Desktop toggle
            sidebar.classList.toggle('collapsed');
            if (mainContent) {
                mainContent.classList.toggle('expanded');
            }
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }

    // Update click handler for mobile/desktop
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            if (window.innerWidth <= 1024) {
                sidebar.classList.toggle('show');
            } else {
                sidebar.classList.toggle('collapsed');
                if (mainContent) {
                    mainContent.classList.toggle('expanded');
                }
                localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            }
        });
    }

    // Handle mobile responsive
    function handleResize() {
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('collapsed');
            if (mainContent) {
                mainContent.classList.remove('expanded');
            }
        } else {
            sidebar.classList.remove('show');
            // Restore collapsed state on desktop
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
                if (mainContent) {
                    mainContent.classList.add('expanded');
                }
            }
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    // Close mobile sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024 && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target) &&
            sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    });
});
// End Admin Sidebar Toggle

// Button Change Status
const buttonsChangeStatus = document.querySelectorAll("[button-change-status]");
if (buttonsChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("#form-change-status");
    const path = formChangeStatus.getAttribute("data-path");

    buttonsChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const statusCurrent = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");

            let statusChange = statusCurrent == "active" ? "inactive" : "active";

            const action = `${path}/${id}?_method=PATCH`;

            formChangeStatus.action = action;

            const inputStatus = document.createElement("input");
            inputStatus.type = "hidden";
            inputStatus.name = "status";
            inputStatus.value = statusChange;

            formChangeStatus.appendChild(inputStatus);
            formChangeStatus.submit();
        });
    });
}
// End Button Change Status

// Button Delete
const buttonsDelete = document.querySelectorAll("[button-delete]");
if (buttonsDelete.length > 0) {
    const formDeleteItem = document.querySelector("#form-delete-item");
    const path = formDeleteItem.getAttribute("data-path");

    buttonsDelete.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc muốn xóa tài khoản này?");

            if (isConfirm) {
                const id = button.getAttribute("data-id");
                const action = `${path}/${id}?_method=DELETE`;

                formDeleteItem.action = action;
                formDeleteItem.submit();
            }
        });
    });
}
// End Button Delete