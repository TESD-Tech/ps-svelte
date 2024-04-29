<svelte:options customElement="ps-svelte-course-level-data" />
<script>
  import { onMount } from 'svelte';
  import GenericModal from './GenericModal.svelte';
  import { cubicOut } from 'svelte/easing';
  import dev_student from '../data/course_level_data_student.json';
  import dev_roster from '../data/course_level_data_roster.json';

  const ethicalities = ['A', 'B', 'H', 'M', 'W', 'U'];
  let data = [];
  let grade_level_lookup = {};
  let courses = {};
  let asOfDate = new Date().toISOString().split('T')[0];
  let showModal = false;
  let selectedCourse;

  const isProduction = !import.meta.env.DEV;

  // Function to fetch data based on environment and date
  async function fetchData(asOfDate) {
    // Default to today's date if no date is provided
    const queryString = asOfDate ? `?asOfDate=${asOfDate}` : `?asOfDate=${new Date().toISOString().split('T')[0]}`;
    return isProduction
      ? await (await fetch(`/admin/ps-svelte/json/course_level_data_roster.json${queryString}`)).json()
      : dev_roster;
  }

  function showCourseDetails(course, ethnicity) {
    // Aggregate student data for the selected course and ethnicity
    course.classes = course.students.reduce((acc, student) => {
      acc[student.COURSE_NAME] ??= { ...ethicalities.reduce((acc, e) => ({ ...acc, [e]: 0 }), {}), TOTAL_STUDENTS: 0, COURSE_NAME: student.COURSE_NAME, GRADE_LEVEL: student.DISPLAY_GRADE};
      acc[student.COURSE_NAME][student.ETHNICITY] += 1;
      acc[student.COURSE_NAME].TOTAL_STUDENTS += 1;
      
      return acc;
    }, {});

    console.log(course)
    selectedCourse = course;
    showModal = true;
  }

  function closeModal() {
    showModal = !showModal;
  }

  // Function to process student data and populate grade_level_lookup
  function processStudentData(students) {
    // Re-init grade_level_lookup
    grade_level_lookup = {}

    students.forEach(student => {
      if (student.DISPLAY_GRADE === 'Grade 13' || student.ETHNICITY === 'I') return;
      grade_level_lookup[student.DISPLAY_GRADE] ??= {
        SCHOOL: student.SCHOOL,
        ...ethicalities.reduce((acc, e) => ({ ...acc, [e]: 0 }), {}),
        TOTAL_STUDENTS: 0,
        DISPLAY_GRADE: student.DISPLAY_GRADE,
      };
      grade_level_lookup[student.DISPLAY_GRADE].TOTAL_STUDENTS += 1;
      grade_level_lookup[student.DISPLAY_GRADE][student.ETHNICITY] += 1;
    });
  }

  // Function to process course data and populate courses
  function processCourseData(rosters) {
    rosters.forEach(r => {
      courses[r.DISPLAY_NAME] ??= {
        SCHOOL: r.SCHOOL,
        DISPLAY_NAME: r.DISPLAY_NAME,
        ...ethicalities.reduce((acc, e) => ({ ...acc, [e]: 0 }), {}),
        TOTAL_STUDENTS: 0,
        SORT_ORDER: r.SORT_ORDER,
        DISPLAY_GRADE: r.DISPLAY_GRADE,
        students: [],
      };
      courses[r.DISPLAY_NAME].TOTAL_STUDENTS += 1;
      courses[r.DISPLAY_NAME][r.ETHNICITY] += 1;
      courses[r.DISPLAY_NAME].students.push(r);
    });
  }

  // Function to calculate percentages and format data
  function formatData(groupedData) {
    return Object.values(groupedData).map(item => ({
      ...item,
      ...ethicalities.reduce((acc, e) => ({
        ...acc,
        [`${e}_PERCENTAGE`]: Math.round(item[e] / item.TOTAL_STUDENTS * 100),
      }), {}),
    }));
  }

  // Function to sort the data array by school and then by SORT_ORDER
  function sortData(dataToSort) {
    return Object.values(dataToSort).sort((a, b) => {
      if (a.SORT_ORDER.slice(-4) < b.SORT_ORDER.slice(-4)) return -1;
      if (a.SORT_ORDER.slice(-4) > b.SORT_ORDER.slice(-4)) return 1;
      if (a.SORT_ORDER < b.SORT_ORDER) return -1;
      if (a.SORT_ORDER > b.SORT_ORDER) return 1;
      return 0;
    })
  }

  // Update data function
  async function updateData(asOfDate) {
    const rosters = await fetchData(asOfDate);
    if (!asOfDate) asOfDate = new Date().toISOString().split('T')[0];
    processStudentData(isProduction ? await (await fetch(`/admin/ps-svelte/json/course_level_data_student.json?asOfDate=${asOfDate}`)).json() : dev_student);
    processCourseData(rosters);
    let groupedData = rosters.reduce((acc, item) => {
      const key = `${item.DISPLAY_NAME}-${item.DISPLAY_GRADE}`;
      item.students = [];
      acc[key] ??= { ...item, ...ethicalities.reduce((acc, e) => ({ ...acc, [e]: 0 }), {}), TOTAL_STUDENTS: 0 };
      acc[key][item.ETHNICITY]++;
      acc[key].students.push(item);
      acc[key].TOTAL_STUDENTS++;
      return acc;
    }, {});

    data = formatData(groupedData);
    data = sortData(data);
    // data = insertGradeLevelData(data);

    courses = sortData(formatData(courses));

    // tasteTheRainbow();
  }

  // Function to get total enrollments for a course 
  function getEnrollments(course) {
    return ethicalities.reduce((total, e) => total + course[e], 0);
  }

  // Toggle the pulse class on the table cells
  function tasteTheRainbow() {
    document.querySelectorAll('.pulse').forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove('pulse');
        void el.offsetWidth; // force reflow
        el.classList.add('pulse');
      }, i * 2);
    });
  }

  function filterData(school) {
    let filteredData = data.filter(d => d.SCHOOL === school);
    
    let distinctGradeLevels = new Set(filteredData.map(item => item.DISPLAY_GRADE)).size;
    let distinctSchedDepartments = new Set(filteredData.map(item => item.SCHED_DEPARTMENT)).size;

    return {
      data: filteredData,
      distinctGradeLevels: distinctGradeLevels,
      distinctSchedDepartments: distinctSchedDepartments
    };
  }

  function ethnicPercentageByGradeLevel(course, ethnicity) {
    console.log(course, ethnicity)
    return
  }

  onMount(async () => {
    await updateData();
  });

  $: schools = [...new Set(['High School', 'Middle School', 'Elementary School'])];
  $: {
    (async () => {
      await updateData(asOfDate);
      // tasteTheRainbow()
    })();
  }
</script>

<div id="report" class="">
  <GenericModal title={selectedCourse ? selectedCourse.DISPLAY_NAME : ''} bind:isOpen={showModal} on:close={closeModal}>
    <div slot="body">
      {#if selectedCourse}
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {#each Object.values(selectedCourse.classes) as course}
              <tr>
                <td class="text-right">{course.COURSE_NAME}, {course.GRADE_LEVEL}</td>
                <td class="text-left">{course.TOTAL_STUDENTS}</td>
              </tr>
            {/each}
            <tr>
              <td>&nbsp;</td>
              <td class="text-xl font-bold text-center">Total: {getEnrollments(selectedCourse)}</td>
            </tr>
          </tbody>
        </table>
      {/if}
    </div>
  </GenericModal>
  <div class="pb-4">
    <label for="asOfDate">As of: </label>
    <input type="date" bind:value={asOfDate} id="asOfDate">
  </div>
  <div id="tables" class="grid grid-flow-col gap-6 border-collapse grid-cols-1 grid-rows-5">
    {#each schools as school}
      <table class="table">
        <thead>
          <tr>
            <th class="bg-gray-400">&nbsp;</th>
            <th class="bg-gray-400">Course Name</th>
            <th class="bg-gray-400">Enrollments</th>

            {#each ethicalities as e}
              <th class="bg-gray-400">Actual {e}</th>
              <th class="bg-gray-400">% {e}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each filterData(school).data as course, index}
            
               {#if index === 0 || ((course.SCHED_DEPARTMENT !== filterData(school).data[index - 1].SCHED_DEPARTMENT || course.DISPLAY_GRADE !== filterData(school).data[index - 1].DISPLAY_GRADE) && index != 0)}
                <tr>
                  {#if index === 0}
                  <td class="rotate" rowspan={data.filter(d => d.SCHOOL === school).length + filterData(school).distinctGradeLevels + filterData(school).distinctSchedDepartments}>{school}</td>
                  {/if}
                  <td class="bg-gray-400">&nbsp;</td>
                  <td class="text-center bg-gray-400">{course.DISPLAY_GRADE}</td> 

                  {#each ethicalities as e}
                    <td class="text-center bg-gray-400" colspan=2>{e}: {Math.round(grade_level_lookup[course.DISPLAY_GRADE][e] / grade_level_lookup[course.DISPLAY_GRADE].TOTAL_STUDENTS * 100)}%
                    
                      ({grade_level_lookup[course.DISPLAY_GRADE][e]} / {grade_level_lookup[course.DISPLAY_GRADE].TOTAL_STUDENTS} * 100)
                    
                    </td>
                  {/each}
                </tr>
              {/if}
              <tr>
                <td class="text-center">{course.DISPLAY_NAME}</td>
                <td on:click={() => showCourseDetails(course)} class="text-center hover:cursor-pointer" style="animation-delay: {index * 0.1}s">{getEnrollments(course)}</td>

                {#each ethicalities as e}
                  <td class="text-center" style="animation-delay: {index * 0.1}s">{course[e]}</td>
                  <td class="text-center" style="animation-delay: {index * 0.1}s">{Math.round(course[e] / getEnrollments(course) * 100)}%</td>
                {/each}
              </tr>
          {/each}
        </tbody>
      </table>
    {/each}
    
    <div class="grid grid-cols-2">
      <div>
        <div class="border border-black p-2">
          <h4 class="text-center font-bold">Key</h4>
          <div class="grid grid-cols-2 gap-2">
            <div>A: Asian</div>
            <div>M: Multiracial</div>
            <div>B: Black or African American</div>
            <div>W: White</div>
            <div>H: Hispanic/Latino</div>
          </div>
        </div>
      </div>

      <div>
        <div class="border border-black p-2">
          <h4 class="text-center font-bold">CHS Levels</h4>
          <div class="grid grid-cols-2 gap-2">
            <div class="border-2 border-indigo-500">AP: Advanced Placement</div>
            <div>X: Accelerated</div>
            <div>H: Honors</div>
            <div>A: Academic</div>
          </div>
        </div>
      </div>

      <div class="col-span-2">
        <div class="border border-black p-2">
          <div>Gray Lines: Actual population distribution of school or grade</div>
        </div>
      </div>
    </div>
  </div>

  <pre>
    {JSON.stringify(grade_level_lookup, null, 2)}
  </pre>
</div>


<style>
  .rotate {
    transform: rotate(-90deg);

    white-space: nowrap;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  table th, table td {
    border: 1px solid black;
    padding: 8px;
  }

  #report {
    font-family: Arial, Helvetica, sans-serif
  }

  @keyframes pulse {
    0% { background-color: #FFB3BA; opacity: 1; } /* Light Red */
    14% { background-color: #FFDFBA; opacity: .9; } /* Light Orange */
    28% { background-color: #FFFFBA; opacity: .8; } /* Light Yellow */
    42% { background-color: #BAFFC9; opacity: .7; } /* Light Green */
    57% { background-color: #BAE1FF; opacity: .7; } /* Light Blue */
    71% { background-color: #BABAFF; opacity: .8; } /* Light Indigo */
    85% { background-color: #DABAFF; opacity: .9; } /* Light Violet */
    100% { background-color: #FFB3BA; opacity: 1; } /* Light Red */
  }
</style>