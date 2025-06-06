import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DynamicFormFields, FormField } from 'src/app/models/chatbot.model';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css'],
})
export class DynamicFormComponent implements OnInit {
  formFields = input.required<{ [key: string]: FormField }>();

  formSubmit = output<any>();

  dynamicForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createForm();
  }

  private createForm() {
    let group = {};

    group = this.createNestedGroup(this.formFields());

    this.dynamicForm = this.fb.group(group);

    console.log('group', this.dynamicForm);
  }

  createNestedGroup(fields: any) {
    const group = {};
    if (typeof fields !== 'string') {
      Object.keys(fields).forEach((key) => {
        const field = fields[key];

        if (Array.isArray(field)) {
          field.forEach((fieldItem) => {
            (group as { [key: string]: any })[key] =
              this.createNestedGroup(fieldItem);
          });
        } else if (typeof fields[key] === 'object') {
            (group as { [key: string]: any })[key] = [
              field.value,
              field.required ? Validators.required : [],
            ];
        }
      });
    }
    return group;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  onSubmit() {
    if (this.dynamicForm.valid) {
      this.formSubmit.emit(this.dynamicForm.value);
    }
  }
}
