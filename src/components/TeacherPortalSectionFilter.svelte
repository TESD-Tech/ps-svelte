<svelte:options customElement="ps-svelte-teacher-portal-section-filter" />
<script>
  import { onMount } from 'svelte'
  import md5 from 'md5'
  import devSections from '../assets/sections.json'

  // Determine the environment (production or development)
  const isProduction = !import.meta.env.DEV;

  // Array for section data
  let sections = []

  // Set for unique filters
  let filters = new Set()

  // Asynchronously load sections data
  async function loadSections() {
    if (isProduction) {
      // Fetch sections data from the production server
      const response = await fetch('/teachers/json/teacher_portal_section.json')
      sections = await response.json()
    } else {
      // Use development sections data
      sections = devSections
    }
  }

  // Process a section and add filters
  function processSection(section) {
    const this_section = document.querySelector(`[sectionid="${section.ID}"]`)
    // Flag indicating if the section is in session
    let not_in_session

    // Check if the section is in session
    if (this_section)
      not_in_session = this_section.querySelector('[src="/images/img/btn_chair_notinsession.png"]')

    // Filters for each section
    const this_filters = [
      `Course: ${section.COURSE_NAME}`,
      `Exp: ${section.EXTERNAL_EXPRESSION}`,
      `Term: ${section.TERM}`,
      `Period: ${section.EXTERNAL_EXPRESSION.split('(')[0]}`,
      `Days: ${section.EXTERNAL_EXPRESSION.split('(')[1].replaceAll(')', '')}`,
      `${section.ACTIVE == 1 ? 'Term: Active' : 'Inactive'}`,
      `Meets Today: ${not_in_session ? 'No' : 'Yes'}`
    ]

    // Add each filter to the set
    this_filters.forEach(filter => {
      filters.add(filter)

      if (this_section)
        this_section.classList.add(md5(filter))
    })
  }

  function handleSelectChange(event) {
    // Get the selected filter
    const selected_filter = event.target.value

    // Get all sections
    const all_sections = document.querySelectorAll('[sectionid]')

    // Hide all sections
    all_sections.forEach((section) => {
      section.classList.remove('hidden')

      if (selected_filter && !section.classList.contains(selected_filter)) {
        section.classList.add('hidden')
      }
    })
  }

  // Lifecycle hook: Runs after the component is mounted
  onMount(async () => {
    // Load sections data and process filters
    await loadSections()
    sections.forEach(processSection)

    // Sort filters with special handling for 'Meets Today' and 'All Classes'
    filters = new Set([...Array.from(filters).sort((a, b) => a.includes('Meets Today:') ? -1 : a.localeCompare(b))])
  })
</script>

<!-- Dropdown menu for section filters -->
<select name="section_filters" id="section_filters" on:change={handleSelectChange}>
  <option value="">All Classes</option>
  {#if filters.size > 0}
    {#each Array.from(filters) as filter, index (index)}
      <!-- Use md5 hash as the option value for uniqueness -->
      <option value={md5(filter)}>{filter}</option>
    {/each}
  {:else}
    <!-- Display a message if no filters are available -->
    <option value="">No filters available</option>
  {/if}
</select>

<style>
  /* Styling for the section_filters dropdown */
  #section_filters {
    margin: 0 0 0 10px;
    padding: 0;
    height: 30px;
    font-size: 14px;
    font-weight: bold;
    color: #000;
    background-color: #fff;
    border: 1px solid #000;
    border-radius: 5px;
  }
</style>
