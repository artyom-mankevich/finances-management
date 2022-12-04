import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TransactionModalModes } from 'src/app/enums/transactionModalModes';
import { Icon } from 'src/app/models/icon';
import { TransactionCategory } from 'src/app/models/transactionCategory';
import { DataStorageService } from 'src/app/services/data-storage.service';
import { DataService } from 'src/app/services/data.service';
import { WhiteSpaceValidator } from 'src/app/validators/whitespace.validator';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.css']
})
export class CategoryModalComponent implements OnInit {

  modalMode: TransactionModalModes = TransactionModalModes.Create;
  form: FormGroup;
  icons$: Observable<Icon[]> = this.ds.getAvailableIcons();
  @Input()
  category: TransactionCategory = {
    id: null,
    userId: '',
    name: '',
    icon: '',
    color: this.dss.colors[Math.floor(Math.random() * this.dss.colors.length)]
  }
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, public dss: DataStorageService, private dialogRef: MatDialogRef<CategoryModalComponent>, private ds: DataService) {
    this.form = fb.group({
      name: ['', [Validators.required, WhiteSpaceValidator.noWhiteSpace]]
    });

    if (this.data) {
      this.category = data.category;
      this.modalMode = TransactionModalModes.Update;
      this.updateFormFields();
    }

    this.form.controls['name'].valueChanges.subscribe(name => this.category.name = name);
  }


  changeColor(color: string) {
    this.category.color = color;
  }

  modifyCategory() {
    if (this.modalMode === TransactionModalModes.Create) {
      this.ds.createTransactionCategory(this.category).subscribe();
    }
    else if (this.modalMode === TransactionModalModes.Update) {
      this.ds.updateTransactionCategory(this.category).subscribe();
    }
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
