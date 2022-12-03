import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TransactionModalModes } from 'src/app/enums/transactionModalModes';
import { TransactionCategory } from 'src/app/models/transactionCategory';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.css']
})
export class CategoryModalComponent implements OnInit {

  modalMode: TransactionModalModes = TransactionModalModes.Create;
  form: FormGroup;
  @Input()
  category: TransactionCategory = {
    id: null,
    userId: '',
    name: '',
    icon: '',
    color: this.dss.colors[Math.floor(Math.random() * this.dss.colors.length)]
  }
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, public dss: DataStorageService, private dialogRef: MatDialogRef<CategoryModalComponent>) {
    this.form = fb.group({
      name: []
    });

    if (this.data) {
      this.category = data.category;
      this.modalMode = TransactionModalModes.Update;
      this.updateFormFields();
    }
  }


  changeColor(color: string) {
    this.category.color = color;
  }

  modifyCategory() {
    this.dialogRef.close();
  }

  updateFormFields() {
    this.form.patchValue({
      name: this.category.name
    })
  }

  selectIcon(icon: string) {
    this.category.icon = icon;
  }

  deleteCategory() {

  }

  ngOnInit(): void {
  }

}
