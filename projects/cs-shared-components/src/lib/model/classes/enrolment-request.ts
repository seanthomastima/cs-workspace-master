export class EnrolmentRequest {
  public FSKey:                           string;
  public recipientEmailAddress            = '';
  public recipientName                    = '';
  public customerFSKey:                   string;
  public enrolmentType:                   string;
  public enrolmentCompleted               = false;
  public enrolmentCompletedTimeStamp:     number;
  public createdTimeStamp:                number;

  static fromJsonList(array: any): EnrolmentRequest[] {

    return array.map(EnrolmentRequest.fromJson);

  }

  static fromJson(enrolment: {
    FSKey,
    recipientEmailAddress,
    recipientName,
    customerFSKey,
    enrolmentType,
    enrolmentCompletedTimeStamp,
    enrolmentCompleted,
    enrolmentTimeStamp,
    createdTimeStamp
  }): EnrolmentRequest {

    return enrolment;

  }

  constructor() {

    this.createdTimeStamp = Date.now();

  }
}
