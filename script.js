const prices = { dark: 60, milk: 60, white: 60 };
let cart = { dark: 0, milk: 0, white: 0 };

function updateQuantity(type, change) {
  if (cart[type] + change >= 0) {
    cart[type] += change;
    document.getElementById(`${type}-count`).innerText = cart[type];
    updateCartDisplay();
  }
}

function updateCartDisplay() {
  const cartList = document.getElementById("cart-list");
  const subtotalSpan = document.getElementById("subtotal");
  const totalSpan = document.getElementById("total");

  cartList.innerHTML = "";
  let subtotal = 0;
  for (let item in cart) {
    if (cart[item] > 0) {
      const cost = cart[item] * prices[item];
      subtotal += cost;
      const li = document.createElement("li");
      li.innerText = `${capitalize(item)} Chocolate x ${cart[item]} = ₹${cost}`;
      cartList.appendChild(li);
    }
  }

  const delivery = 60;
  subtotalSpan.innerText = subtotal;
  totalSpan.innerText = subtotal + delivery;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showCheckout() {
  document.getElementById("checkout").classList.remove("hidden");
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function toggleQR(method) {
  document.getElementById("qr").classList.toggle("hidden", method !== "UPI");
}

function placeOrder() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const payment = document.getElementById("payment").value;

  if (!name || !phone || !address || !payment) {
    alert("Please fill in all required details.");
    return;
  }

  alert("Order placed successfully!");
}