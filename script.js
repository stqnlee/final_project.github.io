$(function() {
  const CART_KEY = 'orderra_cart'; 
  const THEME_KEY = 'orderra_theme';
  function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  }
  function saveCart(c) {
    localStorage.setItem(CART_KEY, JSON.stringify(c));
  }
  function renderCart() {
    const cart = getCart();
    const $list = $('#cartList');
    $list.empty();
    if (!cart.length) {
      $list.append('<tr><td colspan="4" class="text-center">Cart is empty</td></tr>');
      $('#cartTotal').text('$0');
      return;
    }
    let total = 0;
    cart.forEach((item, idx) => {
      const itemTotal = Number(item.price) * item.quantity;
      total += itemTotal;
      $list.append(
        `<tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${itemTotal.toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-outline-danger remove-item" data-idx="${idx}" aria-label="Remove ${item.name} from cart">Remove</button>
          </td>
        </tr>`
      );
    });
    $('#cartTotal').text('$' + total.toFixed(2));
  }

  $(document).on('click', '.add-to-cart', function() {
    const $button = $(this);
    const name = $button.data('name');
    const price = $button.data('price');
    const cart = getCart();

    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity += 1; 
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    saveCart(cart);
    renderCart();
    $('#cartTotal').fadeOut(120).fadeIn(120);

    $button.text('Added!').prop('disabled', true);
    setTimeout(() => {
      $button.text('Add').prop('disabled', false);
    }, 1000);
  });

  $(document).on('click', '.remove-item', function() {
    const idx = $(this).data('idx');
    const cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
  });

  $('#clearCart').on('click', function() {
    localStorage.removeItem(CART_KEY);
    renderCart();
  });
  renderCart();

  function setTheme(theme) {
    if (theme === 'dark') {
      $('body').addClass('dark-mode');
      $('#themeToggle').text('Light Mode');
    } else {
      $('body').removeClass('dark-mode');
      $('#themeToggle').text('Dark Mode');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  setTheme(savedTheme);

  $('#themeToggle').on('click', function() {
    const currentTheme = localStorage.getItem(THEME_KEY) || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });

  function fetchProducts() {
    $.ajax({
      url: 'https://fakestoreapi.com/products?limit=6',
      method: 'GET',
      success: function(products) {
        const $productList = $('#productList');
        $productList.empty();
        products.forEach((product, idx) => {
          $productList.append(`
            <div class="col-12 col-md-6 col-lg-4">
              <article class="card product-card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.title}">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${product.title}</h5>
                  <p class="card-text">${product.description.substring(0, 50)}...</p>
                  <div class="mt-auto d-flex justify-content-between align-items-center">
                    <strong>$${product.price}</strong>
                    <div>
                      <button class="btn btn-sm btn-primary add-to-cart" data-name="${product.title}" data-price="${product.price}" aria-label="Add ${product.title} to cart">Add</button>
                      <a href="order.html?product=${encodeURIComponent(product.title)}" class="btn btn-sm btn-outline-primary">Order</a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          `);
        });
        $('.product-card').hide().each(function(i) {
          $(this).delay(i * 120).fadeIn(250);
        });
      },
      error: function() {
        $('#productList').append('<p class="text-danger">Failed to load products. Please try again later.</p>');
      }
    });
  }
  if (location.pathname.endsWith('catalog.html') || location.pathname.endsWith('/catalog.html')) {
    fetchProducts();
  }

  function enableValidation(formId, onSuccess) {
    const $form = $(formId);
    const $inputs = $form.find('input,select,textarea');

    $inputs.on('input change', function() {
      const el = this;
      if (!el.checkValidity()) {
        $(el).addClass('is-invalid').removeClass('is-valid');
      } else {
        $(el).addClass('is-valid').removeClass('is-invalid');
      }
      if (el.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(el.value)) {
          $(el).addClass('is-invalid').removeClass('is-valid');
          $(el).siblings('.invalid-feedback').text('Please enter a valid email address');
        }
      }
      if (el.id === 'phone') {
        const phoneRegex = /^\+?\d{7,15}$/;
        if (!phoneRegex.test(el.value)) {
          $(el).addClass('is-invalid').removeClass('is-valid');
          $(el).siblings('.invalid-feedback').text('Please enter a valid phone number (7-15 digits)');
        }
      }
    });

    $form.on('submit', function(e) {
      e.preventDefault();
      const form = this;
      let valid = true;
      $inputs.each(function() {
        const el = this;
        if (!el.checkValidity()) {
          $(el).addClass('is-invalid').removeClass('is-valid');
          valid = false;
        } else {
          $(el).addClass('is-valid').removeClass('is-invalid');
        }
      });
      if (valid) {
        onSuccess && onSuccess();
        $(form).find('button[type="submit"]').prop('disabled', true).text('Sent');
        setTimeout(() => {
          $(form).find('button[type="submit"]').prop('disabled', false).text(formId === '#supportForm' ? 'Send Message' : 'Confirm and Pay');
          $inputs.removeClass('is-valid');
          form.reset();
        }, 1400);
      } else {
        $(form).find('.is-invalid').first().focus();
      }
    });
  }

  enableValidation('#supportForm', function() {
    console.log('Support message sent');
    alert('Message sent. Support will contact you soon.');
  });

  enableValidation('#orderForm', function() {
    const orderNo = 'AF-' + Math.floor(Math.random() * 9000 + 1000);
    alert('Order confirmed: ' + orderNo);
    localStorage.removeItem(CART_KEY);
    renderCart();
  });

  $('#btnSearch').on('click', function() {
    const q = $('#searchOrder').val().trim().toUpperCase();
    if (!q) {
      $('#ordersTable tbody tr').show();
      return;
    }
    $('#ordersTable tbody tr').each(function() {
      const $tr = $(this);
      const order = $tr.children().first().text().trim().toUpperCase();
      if (order.indexOf(q) !== -1) {
        $tr.show().addClass('table-primary');
        $tr.fadeOut(80).fadeIn(80).delay(700).queue(function(next) {
          $(this).removeClass('table-primary');
          next();
        });
      } else {
        $tr.hide();
      }
    });
  });

  function prefillFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    if (product) {
      const name = decodeURIComponent(product);
      const cart = getCart();
      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ name, price: 0, quantity: 1 });
      }
      saveCart(cart);
      renderCart();
      $('<div class="order-added-notice alert alert-success position-fixed top-0 end-0 m-3">Added ' + name + '</div>')
        .appendTo('body').delay(1200).fadeOut(400, function() {
          $(this).remove();
        });
    }
  }
  prefillFromQuery();

  (function highlightNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    $('.navbar-nav .nav-link').each(function() {
      const href = $(this).attr('href');
      if (href === path) $(this).addClass('active');
    });
  })();
});