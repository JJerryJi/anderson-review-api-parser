// Example data for countries, exams, and exempt schools
const countryData = [
    {
      name: 'Country A',
      requiresExam: true,
      exemptSchools: ['School A1', 'School A2']
    },
    {
      name: 'Country B',
      requiresExam: false,
      exemptSchools: []
    },
    {
      name: 'Country C',
      requiresExam: true,
      exemptSchools: []
    }
  ];
  
  // Populate the dropdown menu with countries
  $.each(countryData, function (index, country) {
    $('#country-select').append(`<option value="${index}">${country.name}</option>`);
  });
  
  // Add a change event listener to the dropdown menu
  $('#country-select').on('change', function () {
    const selectedIndex = $(this).val();
  
    if (selectedIndex === "") {
      $('#exam-info').html('');
      $('#exempt-schools').html('');
    } else {
      const selectedCountry = countryData[selectedIndex];
  
      // Update exam information based on the selected country
      const examInfo = selectedCountry.requiresExam ? 'An exam is required.' : 'No exam is required.';
      $('#exam-info').html(examInfo);
  
      // Update the list of exempt schools based on the selected country
      if (selectedCountry.exemptSchools.length > 0) {
        const exemptSchoolsList = $('<ul></ul>');
        $.each(selectedCountry.exemptSchools, function (index, school) {
          exemptSchoolsList.append(`<li>${school}</li>`);
        });
        $('#exempt-schools').html('<h3>Exempt Schools:</h3>').append(exemptSchoolsList);
      } else {
        $('#exempt-schools').html('');
      }
    }
  });