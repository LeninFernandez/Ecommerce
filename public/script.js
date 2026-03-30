const API = "/api";

function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem("token", token);
}

function authHeader() {
    return {
        Authorization: "Bearer " + getToken(),
        "Content-Type": "application/json"
    };
}

function redirectIfNotLoggedIn() {
    if (!getToken()) window.location.href = "auth.html";
}

//  LOGOUT & NAV 
function logout() {
    localStorage.removeItem("token");
    //alert("You have been logged out.");
    window.location.href = "auth.html";
}

function updateNavigation() {
    const loginLink = document.getElementById("navLogin");
    const logoutLink = document.getElementById("navLogout");
    if (getToken()) {
        if (loginLink) loginLink.style.display = "none";
        if (logoutLink) logoutLink.style.display = "inline";
    } else {
        if (loginLink) loginLink.style.display = "inline";
        if (logoutLink) logoutLink.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", updateNavigation);

// GLOBAL SEARCH
const searchInput = document.getElementById("globalSearch");
if (searchInput) {
    searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            window.location.href = `shop.html?search=${encodeURIComponent(searchInput.value)}`;
        }
    });
}

//  SHOP PAGE 
let currentPage = 1;
const PAGE_LIMIT = 100;

async function loadProducts(page = 1, limit = PAGE_LIMIT) {
    const container = document.getElementById("productGrid");
    if (!container) return;

    container.innerHTML = "<p>Loading...</p>";

    try {
        const maxPrice = document.getElementById("priceFilter")?.value || "";
        const category  = document.getElementById("categoryFilter")?.value || "";
        const sort      = document.getElementById("sortSelect")?.value || "";
        const inStock   = document.getElementById("saleFilter")?.checked ? "true" : "";
        const search    = new URLSearchParams(window.location.search).get("search") || "";

        const params = new URLSearchParams({ page, limit });
        if (maxPrice && Number(maxPrice) < 100000) params.set("maxPrice", maxPrice);
        if (category) params.set("category", category);
        if (sort)     params.set("sort", sort);
        if (inStock)  params.set("inStock", inStock);
        if (search)   params.set("search", search);

        const res  = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        const products = data.products;
        container.innerHTML = "";

        if (!products || products.length === 0) {
            container.innerHTML = "<p>No products found.</p>";
            return;
        }

        // Group by category for display
        const grouped = {};
        products.forEach(p => {
            if (!grouped[p.category]) grouped[p.category] = [];
            grouped[p.category].push(p);
        });

        for (const cat in grouped) {
            const section = document.createElement("div");
            section.className = "category-section";

            const heading = document.createElement("h3");
            heading.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            section.appendChild(heading);

            const grid = document.createElement("div");
            grid.className = "product-grid";

            grouped[cat].forEach(p => {
                const card = document.createElement("div");
                card.className = "product-card";
                card.innerHTML = `
                    <img src="${p.image}" alt="${p.name}">
                    <h4>${p.name}</h4>
                    <p>&#8377;${p.price}</p>
                    <p>${p.inventoryCount > 0 ? p.inventoryCount + " in stock" : "Out of Stock"}</p>
                    <button ${p.inventoryCount === 0 ? "disabled" : ""} onclick="addToCart('${p._id}')">
                        ${p.inventoryCount === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button onclick="window.location.href='product.html?id=${p._id}'">
                        View Details
                    </button>
                `;
                grid.appendChild(card);
            });

            section.appendChild(grid);
            container.appendChild(section);
        }

        // Pagination
        const pagination = document.createElement("div");
        pagination.className = "pagination";

        if (page > 1) {
            const prev = document.createElement("button");
            prev.textContent = "Previous";
            prev.onclick = () => { currentPage = page - 1; loadProducts(currentPage, limit); };
            pagination.appendChild(prev);
        }

        if (page < data.totalPages) {
            const next = document.createElement("button");
            next.textContent = "Next";
            next.onclick = () => { currentPage = page + 1; loadProducts(currentPage, limit); };
            pagination.appendChild(next);
        }

        container.appendChild(pagination);

    } catch (err) {
        console.error("loadProducts error:", err);
        container.innerHTML = "<p>Failed to load products.</p>";
    }
}

//  FILTER/SORT EVENT LISTENERS 
document.getElementById("priceFilter")?.addEventListener("input", () => {
    currentPage = 1;
    loadProducts(currentPage);
});
document.getElementById("saleFilter")?.addEventListener("change", () => {
    currentPage = 1;
    loadProducts(currentPage);
});
document.getElementById("categoryFilter")?.addEventListener("change", () => {
    currentPage = 1;
    loadProducts(currentPage);
});
document.getElementById("sortSelect")?.addEventListener("change", () => {
    currentPage = 1;
    loadProducts(currentPage);
});

// Initial shop load
if (document.getElementById("productGrid")) {
    loadProducts(currentPage);
}

//  PRODUCT PAGE 
const productContainer = document.getElementById("productContainer");

if (productContainer) {
    const id = new URLSearchParams(window.location.search).get("id");

    async function loadProduct() {
        if (!id) { productContainer.innerHTML = "<p>No product specified.</p>"; return; }

        productContainer.innerHTML = "<p>Loading...</p>";

        try {
            const res     = await fetch(`/api/products/${id}`);
            const product = await res.json();

            if (!product || !product._id) {
                productContainer.innerHTML = "<p>Product not found.</p>";
                return;
            }

            productContainer.innerHTML = `
                <div class="product-page-container">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h2>${product.name}</h2>
                        <p id="productPrice">&#8377;${product.price}</p>
                        ${product.description ? `<p id="productDescription">${product.description}</p>` : ""}
                        <p id="productStock">${product.inventoryCount > 0 ? product.inventoryCount + " in stock" : "Out of Stock"}</p>
                        <button id="addCart" class="add-cart-btn ${product.inventoryCount === 0 ? 'out-of-stock' : ''}"
                            ${product.inventoryCount === 0 ? 'disabled' : ''}>
                            ${product.inventoryCount === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
                <div class="reviews-section">
                    <h3>Reviews</h3>
                    <div id="reviews"></div>
                    <h4>Add Review</h4>
                    <div id="reviewForm">
                        <input type="number" id="rating" placeholder="Rating (1-5)" min="1" max="5">
                        <textarea id="comment" placeholder="Your comment"></textarea>
                        <button id="submitReview">Submit Review</button>
                    </div>
                </div>
            `;

            document.getElementById("addCart").onclick = () => addToCart(product._id);
            renderReviews(product.reviews || []);

            document.getElementById("submitReview").onclick = async () => {
                if (!getToken()) return alert("Login required");
                const rating  = Number(document.getElementById("rating").value);
                const comment = document.getElementById("comment").value.trim();
                if (!rating || !comment) return alert("Fill both rating and comment");

                const r = await fetch(`/api/products/${id}/reviews`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + getToken()
                    },
                    body: JSON.stringify({ rating, comment })
                });

                if (r.ok) { alert("Review submitted!"); loadProduct(); }
                else alert("Review failed. You may have already reviewed this product.");
            };

        } catch (err) {
            console.error("loadProduct error:", err);
            productContainer.innerHTML = "<p>Failed to load product.</p>";
        }
    }

    function renderReviews(reviews) {
        const div = document.getElementById("reviews");
        if (!div) return;
        div.innerHTML = reviews.length ? "" : "<p>No reviews yet.</p>";
        reviews.forEach(r => {
            const el = document.createElement("div");
            el.className = "review";
            el.innerHTML = `<strong>${r.userName}</strong><p>Rating: ${r.rating}/5</p><p>${r.comment}</p>`;
            div.appendChild(el);
        });
    }

    loadProduct();
}

//  ADD TO CART 
async function addToCart(productId) {
    if (!getToken()) {
        alert("Please log in to add items to your cart.");
        window.location.href = "auth.html";
        return;
    }

    try {
        const res  = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Failed to add to cart.");
            return;
        }

        alert("Added to cart!");

    } catch (err) {
        console.error("addToCart error:", err);
        alert("Something went wrong. Please try again.");
    }
}

//  CART PAGE 
const cartDiv = document.getElementById("cartItems");

if (cartDiv) {
    redirectIfNotLoggedIn();

    async function loadCart() {
        cartDiv.innerHTML = "<p>Loading cart...</p>";

        try {
            const res  = await fetch("/api/cart", {
                headers: { "Authorization": "Bearer " + getToken() }
            });
            const data = await res.json();

            if (!res.ok) { cartDiv.innerHTML = "<p>Failed to load cart.</p>"; return; }

            const items = data.items;
            cartDiv.innerHTML = "";

            if (!items || items.length === 0) {
                cartDiv.innerHTML = "<p>Your cart is empty.</p>";
                const sub = document.getElementById("subtotal");
                const fin = document.getElementById("finalTotal");
                if (sub) sub.innerText = "Subtotal: Rs. 0";
                if (fin) fin.innerText = "Final Total: Rs. 0";
                return;
            }

            let subtotal = 0;

            for (const item of items) {
                const prodRes = await fetch(`/api/products/${item.productId}`);
                const product = await prodRes.json();

                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;

                const el = document.createElement("div");
                el.className = "cart-item";
                el.innerHTML = `
                    <div class="cart-item-info">
                        <span>${product.name}</span>
                        <span>&#8377;${product.price}</span>
                    </div>
                    <div class="cart-item-actions">
                        <input type="number" value="${item.quantity}" min="1" data-id="${item.productId}">
                        <button data-remove="${item.productId}">Remove</button>
                    </div>
                `;
                el.querySelector("input").onchange  = updateQty;
                el.querySelector("button").onclick  = removeItem;
                cartDiv.appendChild(el);
            }

            const sub = document.getElementById("subtotal");
            const fin = document.getElementById("finalTotal");
            if (sub) sub.innerText = "Subtotal: Rs. " + subtotal;
            if (fin) fin.innerText = "Final Total: Rs. " + subtotal;

        } catch (err) {
            console.error("loadCart error:", err);
            cartDiv.innerHTML = "<p>Something went wrong loading your cart.</p>";
        }
    }

    async function updateQty(e) {
        const productId = e.target.dataset.id;
        const quantity  = Number(e.target.value);
        if (quantity < 1) return;

        try {
            const res = await fetch("/api/cart/update", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getToken()
                },
                body: JSON.stringify({ productId, quantity })
            });
            if (!res.ok) { alert("Failed to update quantity."); return; }
            loadCart();
        } catch (err) {
            console.error("updateQty error:", err);
            alert("Something went wrong.");
        }
    }

    async function removeItem(e) {
        const productId = e.target.dataset.remove;
        try {
            const res = await fetch("/api/cart/remove", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getToken()
                },
                body: JSON.stringify({ productId })
            });
            if (!res.ok) { alert("Failed to remove item."); return; }
            loadCart();
        } catch (err) {
            console.error("removeItem error:", err);
            alert("Something went wrong.");
        }
    }

    loadCart();
}

//  CHECKOUT 
const payBtn = document.getElementById("payBtn");

if (payBtn) {
    redirectIfNotLoggedIn();

    payBtn.onclick = async () => {
        const address    = document.getElementById("address")?.value.trim();
        const cardNumber = document.getElementById("cardNumber")?.value.trim();
        const resultEl   = document.getElementById("paymentResult");

        if (!address)                              return alert("Enter shipping address.");
        if (!cardNumber || cardNumber.length < 16) return alert("Enter a valid 16-digit card number.");

        payBtn.disabled    = true;
        payBtn.textContent = "Processing...";
        if (resultEl) resultEl.innerText = "";

        try {
            const res  = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getToken()
                },
                body: JSON.stringify({ shippingAddress: address, cardNumber })
            });
            const data = await res.json();

            if (!res.ok) {
                if (resultEl) resultEl.innerText = data.error || "Checkout failed.";
                alert(data.error || "Checkout failed. Please try again.");
                return;
            }

            localStorage.setItem("lastOrderId",    data._id);
            localStorage.setItem("lastOrderTotal",  data.totalAmount);
            window.location.href = "order-placed.html";

        } catch (err) {
            console.error("Checkout error:", err);
            if (resultEl) resultEl.innerText = "Something went wrong. Please try again.";
            alert("Something went wrong. Please try again.");
        } finally {
            payBtn.disabled    = false;
            payBtn.textContent = "Pay & Place Order";
        }
    };
}

//  ORDERS 
const ordersDiv = document.getElementById("orders");

if (ordersDiv) {
    redirectIfNotLoggedIn();

    async function loadOrders() {
        ordersDiv.innerHTML = "<p>Loading orders...</p>";

        try {
            const res    = await fetch("/api/orders", {
                headers: { "Authorization": "Bearer " + getToken() }
            });
            const orders = await res.json();

            if (!res.ok) { ordersDiv.innerHTML = "<p>Failed to load orders.</p>"; return; }

            if (!orders || orders.length === 0) {
                ordersDiv.innerHTML = "<p>You have no orders yet.</p>";
                return;
            }

            ordersDiv.innerHTML = "";

            orders.forEach(o => {
                const div = document.createElement("div");
                div.className = "order";
                div.innerHTML = `
                    <h4>Order ID: ${o._id}</h4>
                    <p>Total: &#8377;${o.totalAmount}</p>
                    <p>Status: ${o.paymentStatus}</p>
                    <p>Delivery: In 3 days</p>
                `;
                o.items.forEach(i => {
                    const item = document.createElement("div");
                    item.className = "order-item";
                    item.innerText = `${i.name} x ${i.quantity} — &#8377;${i.price}`;
                    div.appendChild(item);
                });
                ordersDiv.appendChild(div);
            });

        } catch (err) {
            console.error("loadOrders error:", err);
            ordersDiv.innerHTML = "<p>Something went wrong loading your orders.</p>";
        }
    }

    loadOrders();
}




async function injectAdminLink() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("/api/me", {
      headers: { Authorization: "Bearer " + token }
    });
    const user = await res.json();

    if (user.role === "admin") {
      const navRight = document.querySelector(".nav-right");

      if (!document.getElementById("adminLink")) {
        const link = document.createElement("a");
        link.href = "admin.html";
        link.textContent = "Admin";
        link.id = "adminLink";
        link.style.marginLeft = "12px";

        navRight.appendChild(link);
      }
    }
  } catch {}
}

injectAdminLink();
function startAnalogClock() {
  const canvas = document.getElementById("analogClock");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cx = 25, cy = 25, r = 22;

  function draw() {
    const now = new Date();
    const hrs = now.getHours() % 12;
    const min = now.getMinutes();
    const sec = now.getSeconds();

    ctx.clearRect(0, 0, 50, 50);

    // Clock face
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 18, cy + Math.sin(angle) * 18);
      ctx.lineTo(cx + Math.cos(angle) * 21, cy + Math.sin(angle) * 21);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Hour hand
    const hAngle = ((hrs + min / 60) * Math.PI) / 6 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hAngle) * 12, cy + Math.sin(hAngle) * 12);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    // Minute hand
    const mAngle = ((min + sec / 60) * Math.PI) / 30 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(mAngle) * 18, cy + Math.sin(mAngle) * 18);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();

    // Second hand
    const sAngle = (sec * Math.PI) / 30 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sAngle) * 20, cy + Math.sin(sAngle) * 20);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  setInterval(draw, 1000);
  draw();
}

startAnalogClock();