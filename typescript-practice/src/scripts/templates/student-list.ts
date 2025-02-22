// @ts-expect-error
import editIcon from '../../assets/icons/student-list-icons/edit.svg';
// @ts-expect-error
import deleteIcon from '../../assets/icons/student-list-icons/delete.svg';

export const studentRowTemplate = (student: any) => `
  <td class="students__table-cell">
    <img src="${student.avatar}" alt="Student ${student.name}" />
  </td>
  <td class="students__table-cell" data-label="Name">${student.name}</td>
  <td class="students__table-cell" data-label="Email">${student.email}</td>
  <td class="students__table-cell" data-label="Phone Number">${student.phoneNum}</td>
  <td class="students__table-cell" data-label="Enroll Number">${student.enrollNum}</td>
  <td class="students__table-cell" data-label="Date Admission">${student.dateAdmission}</td>
  <td class="students__table-cell">
    <div class="students__table-action">
      <button class="btn btn--edit" data-action="edit" data-id="${student.id}">
        <img src="${editIcon}" alt="Edit student" />
      </button>
      <button class="btn btn--delete" data-action="delete" data-id="${student.id}">
        <img src="${deleteIcon}" alt="Delete student" />
      </button>
    </div>
  </td>
`;
