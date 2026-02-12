/**
 * Form Submission Handler
 * - Handles all site forms (Consultation, Work With Ahmad, Parallax)
 * - Captures IP and Country details
 * - Integrates with Sanity for data persistence
 * - Manages Property Context from Modal triggers
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // --- Global State ---
  const userLocation = { ip: null, country: null };
  let propertyContext = { name: null, id: null, community: null };

  // --- 1. Fetch User Location ---
  fetch('https://ipapi.co/json/')
    .then(r => r.json())
    .then(data => {
      userLocation.ip = data.ip;
      userLocation.country = data.country_name;
      console.log('📍 Location:', userLocation.country);
      
      // Dispatch event for country phone picker auto-detection
      window.__countryPickerDetectedISO = data.country_code;
      window.dispatchEvent(new CustomEvent('countryDetected', {
        detail: { countryCode: data.country_code, countryName: data.country_name }
      }));
    })
    .catch(console.warn);


  // --- 2. Property Context (Modal Listener) ---
  const modal = document.getElementById('consultationModal');
  if (modal) {
    modal.addEventListener('show.bs.modal', function(event) {
      const button = event.relatedTarget;
      if (button) {
        propertyContext = {
          name: button.getAttribute('data-property-name'),
          id: button.getAttribute('data-property-id'),
          community: button.getAttribute('data-property-community')
        };
        
        // Update Title if property name exists
        const title = modal.querySelector('.modal-title');
        if (title && propertyContext.name) {
          title.textContent = `Inquire about ${propertyContext.name}`;
          title.setAttribute('data-original-text', 'Schedule Consultation');
        }
      } else {
        propertyContext = { name: null, id: null, community: null };
        const title = modal.querySelector('.modal-title');
        if (title && title.hasAttribute('data-original-text')) {
           title.textContent = 'Schedule Consultation';
        }
      }
    });

    modal.addEventListener('hidden.bs.modal', function() {
      const form = document.getElementById('consultationForm');
      if(form) form.reset();
      propertyContext = { name: null, id: null, community: null };
      const title = modal.querySelector('.modal-title');
      if (title) title.textContent = 'Schedule Consultation';
    });
  }


  // --- 3. Shared Form Validation & Submission ---
  
  function getFieldValue(id) {
    if(!id) return null;
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  async function handleFormSubmit(e, formConfig) {
    e.preventDefault();
    const form = e.target;
    
    // Basic Validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // UI Loading
    let btn = form.querySelector('button[type="submit"]');
    if (!btn && form.id) {
       btn = document.querySelector(`button[type="submit"][form="${form.id}"]`);
    }
    
    let originalBtnText = '';
    if (btn) {
      originalBtnText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="submit-loading" style="display:inline-block; margin-right: 5px;" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'; 
    }

    // Construct Payload
    const timestamp = new Date().toISOString();
    const payload = {
      _type: 'submission',
      source: formConfig.source,
      ipAddress: userLocation.ip,
      country: userLocation.country,
      submittedAt: timestamp,
      status: 'new',
      
      // Common Fields
      name: getFieldValue(formConfig.fields.name),
      email: getFieldValue(formConfig.fields.email), // Might be null for consultation form
      phone: getFieldValue(formConfig.fields.phone),
      
      // Contextual
      propertyOfInterest: propertyContext.name || getFieldValue(formConfig.fields.message) || 'General Inquiry', 
      
      // Specifics
      message: getFieldValue(formConfig.fields.message),
      preferredDate: getFieldValue(formConfig.fields.date),
      preferredTime: getFieldValue(formConfig.fields.time),
    };

    // Clean undefined/null
    Object.keys(payload).forEach(key => payload[key] === null && delete payload[key]);

    try {
      await submitToSanity(payload);
      
      // Show thank-you message for parallax form instead of alert
      if (formConfig.source === 'parallax-form') {
        const formBox = form.closest('.parallax-form-box');
        if (formBox) {
          formBox.innerHTML = `
            <div class="parallax-thankyou">
              <div class="parallax-thankyou-icon">✓</div>
              <h2 class="parallax-thankyou-heading">Thank You!</h2>
              <p class="parallax-thankyou-text">Your inquiry has been received. Ahmad will personally reach out to you within <strong>30 minutes</strong>.</p>
              <p class="parallax-thankyou-subtext">We look forward to helping you find your dream property.</p>
            </div>
          `;
        }
      } else {
        alert(formConfig.successMessage || 'Thank you! We have received your submission.');
      }
      form.reset();
      
      if (formConfig.modalId) {
        const modalEl = document.getElementById(formConfig.modalId);
        if (window.bootstrap && window.bootstrap.Modal && modalEl) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          if (modalInstance) modalInstance.hide();
        }
      }

    } catch (err) {
      console.error('Submission Error:', err);
      alert('Error submitting form. Please try again.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
      }
    }
  }


  // --- Bind Forms ---

  // A. Consultation Modal Form
  const consultationForm = document.getElementById('consultationForm');
  if (consultationForm) {
    consultationForm.addEventListener('submit', (e) => handleFormSubmit(e, {
      source: 'consultation-modal',
      fields: {
        name: 'fullName',
        phone: 'phoneNumber',
        date: 'preferredDate',
        time: 'preferredTime',
        message: 'remarks' // Mapping remarks to message
      },
      modalId: 'consultationModal',
      successMessage: 'Your consultation request has been scheduled.'
    }));
  }

  // B. Work With Ahmad Form
  const wwjForm = document.querySelector('.wwj-form');
  if (wwjForm) {
    wwjForm.addEventListener('submit', (e) => handleFormSubmit(e, {
      source: 'work-with-ahmad',
      fields: {
        name: 'wwj-name',
        email: 'wwj-email',
        phone: 'wwj-phone',
        message: 'wwj-message'
      }
    }));
  }

  // C. Parallax Form
  const parallaxForm = document.querySelector('.parallax-form');
  if (parallaxForm) {
    parallaxForm.addEventListener('submit', (e) => handleFormSubmit(e, {
      source: 'parallax-form',
      fields: {
        name: 'form-name',
        email: 'form-email',
        phone: 'form-phone'
      }
    }));
  }


  // --- Sanity Write Logic ---
  async function submitToSanity(data) {
    console.log('📤 Submitting:', data);
    
    // Check global token
    const writeToken = window.SanityWriteToken; 
    const config = window.SanityConfig;

    if (!config || !config.projectId || !config.dataset) {
      throw new Error('Sanity Configuration missing');
    }

    if (!writeToken) {
      console.warn('⚠️ No Sanity Write Token. Data NOT saved.');
      console.info('To enable real saving, set window.SanityWriteToken = "sk..."');
      
      // Simulate
      await new Promise(r => setTimeout(r, 1000));
      return { msg: 'Simulated' };
    }

    const mutations = [{ create: data }];
    const url = `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/mutate/${config.dataset}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${writeToken}`
      },
      body: JSON.stringify({ mutations })
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }

});
