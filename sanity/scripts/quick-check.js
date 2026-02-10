import readClient from '../lib/sanityClientRead.js';

readClient.fetch('*[_type == "aboutSection"][0]{ title, slides[0...3]{ title, buttonText } }')
  .then(about => {
    console.log('About section:', about || 'Not found');
  })
  .catch(console.error);