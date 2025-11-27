export class BasicDetails {
  public _id: string = '';
  public _name: string = '';
  public _age: string = '';
  public _mobile: string = '';
  public _gender: string = '';
  public _DOA: string = '';
  public _DOB: string = '';
  public _treatmentType: string = '';
  public _paymentType: string = '';
  public _discount: number = 0;
  public _email: string = '';
  public _cost: number = 0;
  public _issueHealthCard: boolean = false;
  public _validity: string = '';

  constructor(
    private id: string,
    private name: string,
    private age: string,
    private mobile: string,
    private gender: string,
    private DOA: string,
    private DOB: string,
    private treatmentType: string,
    private payment,
    private discount,
    private email,
    private cost,
    private issueHealthCard,
    private validity = '',
  ) {
    this._id = id;
    this._name = name;
    this._age = age;
    this._mobile = mobile;
    this._gender = gender;
    this._DOA = DOA;
    this._DOB = DOB;
    this._treatmentType = treatmentType;
    this._paymentType = payment;
    this._discount = discount;
    this._email = email;
    this._cost = cost;
    this._issueHealthCard = issueHealthCard
    this._validity = validity;
  }
}
