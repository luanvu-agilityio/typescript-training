import Student from '../interfaces/student';
import { generateUUID } from '../helpers/uuid-generator';

export default class StudentModel implements Student {
  public readonly avatar: string;
  public readonly name: string;
  public readonly email: string;
  public readonly phoneNum: string;
  public readonly enrollNum: string;
  public readonly dateAdmission: string;
  public readonly id: string;

  constructor(studentData: Partial<Student>) {
    this.avatar = studentData.avatar || './assets/images/user-images/user-profile.png';
    this.name = studentData.name || '';
    this.email = studentData.email || '';
    this.phoneNum = studentData.phoneNum || '';
    this.enrollNum = studentData.enrollNum || '';
    this.dateAdmission = studentData.dateAdmission || '';
    this.id = studentData.id || generateUUID();
  }
}
