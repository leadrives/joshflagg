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

  // --- 1. Fetch User Location (with fallback services) ---
  function fetchLocation() {
    // Try primary service
    return fetch('https://ipapi.co/json/')
      .then(r => {
        if (!r.ok) throw new Error('ipapi.co failed');
        return r.json();
      })
      .then(data => {
        if (!data.ip) throw new Error('No IP from ipapi.co');
        return {
          ip: data.ip,
          country: data.country_name,
          countryCode: data.country_code
        };
      })
      .catch(() => {
        // Fallback 1: ipinfo.io (no key needed for basic info)
        return fetch('https://ipinfo.io/json?token=')
          .then(r => r.ok ? r.json() : Promise.reject())
          .then(data => ({
            ip: data.ip,
            country: data.country,
            countryCode: data.country
          }))
          .catch(() => {
            // Fallback 2: ip-api.com (free, no key)
            return fetch('https://ip-api.com/json/?fields=query,country,countryCode')
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(data => ({
                ip: data.query,
                country: data.country,
                countryCode: data.countryCode
              }))
              .catch(() => {
                // Fallback 3: Cloudflare trace (always works)
                return fetch('https://www.cloudflare.com/cdn-cgi/trace')
                  .then(r => r.text())
                  .then(text => {
                    const lines = Object.fromEntries(
                      text.trim().split('\n').map(l => l.split('='))
                    );
                    return {
                      ip: lines.ip || 'unknown',
                      country: lines.loc || 'unknown',
                      countryCode: lines.loc || ''
                    };
                  });
              });
          });
      });
  }

  fetchLocation()
    .then(data => {
      userLocation.ip = data.ip;
      userLocation.country = data.country;
      console.log('📍 Location:', data.country, '| IP:', data.ip);
      
      // Dispatch event for country phone picker auto-detection
      window.__countryPickerDetectedISO = data.countryCode;
      window.dispatchEvent(new CustomEvent('countryDetected', {
        detail: { countryCode: data.countryCode, countryName: data.country }
      }));
    })
    .catch(err => {
      console.warn('📍 Location detection failed:', err);
      userLocation.ip = 'unavailable';
      userLocation.country = 'unavailable';
    });


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
      
      // Show thank-you message based on form source
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
      } else if (formConfig.source === 'consultation-modal') {
        // Show thank-you inside the consultation modal
        const modalBody = document.querySelector('#consultationModal .consultation-body');
        const modalFooter = document.querySelector('#consultationModal .consultation-footer');
        if (modalBody) {
          modalBody.innerHTML = `
            <div class="form-thankyou">
              <div class="form-thankyou-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" stroke="#7c6d5c" stroke-width="2" fill="none"/>
                  <path d="M20 33l8 8 16-16" stroke="#7c6d5c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
              </div>
              <h3 class="form-thankyou-heading">Consultation Scheduled!</h3>
              <p class="form-thankyou-text">Thank you, <strong>${getFieldValue('fullName') || 'there'}</strong>. Your consultation request has been received.</p>
              <p class="form-thankyou-text">Ahmad will personally reach out to confirm your appointment within <strong>30 minutes</strong>.</p>
              <p class="form-thankyou-subtext">We look forward to helping you find your dream property in Dubai.</p>
            </div>
          `;
        }
        if (modalFooter) {
          modalFooter.innerHTML = `
            <button type="button" class="btn consultation-submit" data-bs-dismiss="modal" style="width:100%;">Close</button>
          `;
        }
      } else if (formConfig.source === 'work-with-ahmad') {
        // Show thank-you inside the WWJ form section
        const formContainer = form.closest('.work-with-josh-container');
        if (formContainer) {
          // Keep the header, replace form area
          const wwjForm = formContainer.querySelector('.wwj-form');
          if (wwjForm) {
            wwjForm.innerHTML = `
              <div class="form-thankyou wwj-thankyou">
                <div class="form-thankyou-icon">
                  <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="30" stroke="#fff" stroke-width="2" fill="none"/>
                    <path d="M20 33l8 8 16-16" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  </svg>
                </div>
                <h3 class="form-thankyou-heading">Message Sent!</h3>
                <p class="form-thankyou-text">Thank you for reaching out. Ahmad will get back to you within <strong>30 minutes</strong>.</p>
                <p class="form-thankyou-subtext">We appreciate your interest in working with us.</p>
              </div>
            `;
          }
        }
      }
      form.reset();
      
      if (formConfig.modalId && formConfig.source !== 'consultation-modal') {
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
