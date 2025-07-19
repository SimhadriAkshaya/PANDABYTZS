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
  let hasItems = false;

  for (let item in cart) {
    if (cart[item] > 0) {
      hasItems = true;
      const cost = cart[item] * prices[item];
      subtotal += cost;
      const li = document.createElement("li");
      li.innerText = `${capitalize(item)} Chocolate x ${cart[item]} = ₹${cost}`;
      cartList.appendChild(li);
    }
  }

  const delivery = hasItems ? 60 : 0;
  subtotalSpan.innerText = subtotal;
  document.getElementById("delivery").innerText = delivery;
  totalSpan.innerText = subtotal + delivery;

  // Disable checkout button if no items
  document.querySelector(".cart button").disabled = !hasItems;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showCheckout() {
  const checkoutSection = document.getElementById("checkout");
  checkoutSection.classList.remove("hidden");
  checkoutSection.scrollIntoView({ behavior: "smooth" });
}

function toggleQR(method) {
  const qr = document.getElementById("qr");
  qr.classList.toggle("hidden", method !== "UPI");
}

function placeOrder() {
  const name = document.getElementById("name");
  const phone = document.getElementById("phone");
  const address = document.getElementById("address");
  const payment = document.getElementById("payment");

  // Reset previous highlights
  [name, phone, address, payment].forEach(field => field.style.borderColor = "#ccc");

  let isValid = true;

  if (!name.value.trim()) {
    name.style.borderColor = "red";
    isValid = false;
  }
  if (!phone.value.trim()) {
    phone.style.borderColor = "red";
    isValid = false;
  }
  if (!address.value.trim()) {
    address.style.borderColor = "red";
    isValid = false;
  }
  if (!payment.value) {
    payment.style.borderColor = "red";
    isValid = false;
  }

  if (!isValid) {
    alert("⚠️ Please fill in all required details.");
    return;
  }

  alert("✅ Order placed successfully!");
  resetForm();
}

function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("address").value = "";
  document.getElementById("landmark").value = "";
  document.getElementById("payment").value = "";
  document.getElementById("qr").classList.add("hidden");
  cart = { dark: 0, milk: 0, white: 0 };
  ['dark', 'milk', 'white'].forEach(type => {
    document.getElementById(`${type}-count`).innerText = "0";
  });
  updateCartDisplay();

  window.scrollTo({ top: 0, behavior: "smooth" });
}
