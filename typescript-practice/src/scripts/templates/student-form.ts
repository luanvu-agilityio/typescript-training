// @ts-expect-error
import cameraIcon from '../../assets/icons/form-icons/camera.png';
// @ts-expect-error
import calendarIcon from '../../assets/icons/form-icons/calendar.png';

export const studentFormTemplate = (
  formTitle: string,
  student: any,
  submitButtonText: string,
  formatDateForInput: (dateString: string) => string,
) => `
  <div class="popup-header">
    <h2>${formTitle}</h2>
    <button class="close-btn">&times;</button>
  </div>
  <div class="popup-body">
    <div class="profile-upload">
      <div class="profile-placeholder">
        ${
          student?.avatar
            ? `<img src="${student.avatar}" alt="Student avatar" class="student-avatar" />`
            : `<img src="${cameraIcon}" alt="camera" />`
        }
      </div>
      <button class="upload-btn">Upload Photo</button>
      <input type="file" id="avatarUpload" accept="image/*" style="display: none;" />
    </div>
    <form id="studentForm">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" placeholder="Enter student name" value="${student?.name || ''}" />
        <div class="error-message" data-field="name"></div>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="Enter student email" value="${student?.email || ''}" />
        <div class="error-message" data-field="email"></div>
      </div>
      <div class="form-group">
        <label for="phone">Phone</label>
        <input type="tel" id="phone" placeholder="Enter student phone number" value="${student?.phoneNum || ''}" />
        <div class="error-message" data-field="phoneNum"></div>
      </div>
      <div class="form-group">
        <label for="enroll">Enroll Number</label>
        <input type="text" id="enroll" placeholder="Enter enrollment number" value="${student?.enrollNum || ''}" />
        <div class="error-message" data-field="enrollNum"></div>
      </div>
      <div class="form-group">
        <label for="admission">Date of Admission</label>
        <div class="calendar-input">
          <input type="date" id="admission" value="${student?.dateAdmission ? formatDateForInput(student.dateAdmission) : ''}" />
          <img src="${calendarIcon}" alt="calendar icon" />
          <div class="error-message" data-field="dateAdmission"></div>
        </div>
      </div>
    </form>
  </div>
  <div class="popup-footer">
    <button class="btn btn-cancel">Cancel</button>
    <button class="btn btn-add">${submitButtonText}</button>
  </div>
`;
