/**
 * Обработчик формы заявки
 * Отправляет данные через Formspree API
 */
class FormHandler {
  constructor() {
    this.form = document.getElementById('recaptcha');
    this.submitButton = this.form?.querySelector('.button-m');
    this.init();
  }

  init() {
    if (!this.form) {
      console.error('Форма с ID "recaptcha" не найдена');
      return;
    }

    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    this.setLoadingState(true);

    try {
      const formData = this.getFormData();
      await this.sendFormData(formData);
      this.showSuccessMessage();
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
      this.showErrorMessage();
    } finally {
      this.setLoadingState(false);
    }
  }

  validateForm() {
    const nameInput = this.form.querySelector('input[name="name"]');
    const phoneInput = this.form.querySelector('input[name="phone"]');
    const checkbox = this.form.querySelector('input[type="checkbox"]');

    if (!nameInput.value.trim()) {
      this.showFieldError(nameInput, 'Введите ваше имя');
      return false;
    }

    if (!phoneInput.value.trim()) {
      this.showFieldError(phoneInput, 'Введите ваш телефон');
      return false;
    }

    if (!checkbox.checked) {
      this.showFieldError(checkbox, 'Необходимо согласие с политикой конфиденциальности');
      return false;
    }

    return true;
  }

  showFieldError(field, message) {
    // Удаляем предыдущие ошибки
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Добавляем новую ошибку
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#ff4444';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorElement);
    field.style.borderColor = '#ff4444';
    
    // Убираем ошибку при фокусе на поле
    field.addEventListener('focus', () => {
      errorElement.remove();
      field.style.borderColor = '';
    }, { once: true });
  }

  getFormData() {
    const formData = new FormData();
    formData.append('name', this.form.querySelector('input[name="name"]').value.trim());
    formData.append('phone', this.form.querySelector('input[name="phone"]').value.trim());
    formData.append('_subject', 'Новая заявка с сайта Паровозик домино');
    formData.append('_replyto', 'format349@gmail.com');
    
    return formData;
  }

  async sendFormData(formData) {
    // Используем Formspree для отправки формы
    const response = await fetch('https://formspree.io/f/xpwgkqkp', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.innerHTML = '<p class="pf">Отправляем...</p>';
    } else {
      this.submitButton.disabled = false;
      this.submitButton.innerHTML = '<p class="pf">Оставить заявку</p>';
    }
  }

  showSuccessMessage() {
    // Показываем SweetAlert2 уведомление об успехе
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Спасибо!',
        text: 'Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.',
        icon: 'success',
        confirmButtonText: 'Отлично'
      }).then(() => {
        // Перенаправляем на страницу благодарности
        window.location.href = 'good.html';
      });
    } else {
      // Fallback если SweetAlert2 не загружен
      alert('Спасибо! Ваша заявка успешно отправлена.');
      window.location.href = 'good.html';
    }
  }

  showErrorMessage() {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Ошибка',
        text: 'Произошла ошибка при отправке заявки. Попробуйте еще раз или свяжитесь с нами по телефону.',
        icon: 'error',
        confirmButtonText: 'Понятно'
      });
    } else {
      alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.');
    }
  }
}

// Инициализируем обработчик формы когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
  new FormHandler();
});
