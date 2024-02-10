import { InputMaskModule } from 'primeng/inputmask'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgSelectModule } from '@ng-select/ng-select'
import { SharedGlobalIconModule } from '../shared-icons'
import { SharedMainModule } from '../shared-main/shared-main.module'
import { AdvancedInputFilterComponent } from './advanced-input-filter.component'
import { DynamicFormFieldComponent } from './dynamic-form-field.component'
import { FormReactiveService } from './form-reactive.service'
import { FormValidatorService } from './form-validator.service'
import { InputSwitchComponent } from './input-switch.component'
import { InputTextComponent } from './input-text.component'
import { MarkdownTextareaComponent } from './markdown-textarea.component'
import { Retro3CheckboxComponent } from './retro3-checkbox.component'
import { PreviewUploadComponent } from './preview-upload.component'
import { ReactiveFileComponent } from './reactive-file.component'
import {
  SelectCategoriesComponent,
  SelectChannelComponent,
  SelectCheckboxAllComponent,
  SelectCheckboxComponent,
  SelectCustomValueComponent,
  SelectLanguagesComponent,
  SelectOptionsComponent,
  SelectTagsComponent
} from './select'
import { TextareaAutoResizeDirective } from './textarea-autoresize.directive'
import { TimestampInputComponent } from './timestamp-input.component'

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,

    InputMaskModule,
    NgSelectModule,

    SharedMainModule,
    SharedGlobalIconModule
  ],

  declarations: [
    InputTextComponent,
    MarkdownTextareaComponent,
    Retro3CheckboxComponent,
    PreviewUploadComponent,
    ReactiveFileComponent,
    TextareaAutoResizeDirective,
    TimestampInputComponent,

    InputSwitchComponent,

    SelectChannelComponent,
    SelectOptionsComponent,
    SelectTagsComponent,
    SelectCheckboxComponent,
    SelectCustomValueComponent,
    SelectLanguagesComponent,
    SelectCategoriesComponent,
    SelectCheckboxAllComponent,

    DynamicFormFieldComponent,

    AdvancedInputFilterComponent
  ],

  exports: [
    FormsModule,
    ReactiveFormsModule,

    InputMaskModule,
    NgSelectModule,

    InputTextComponent,
    MarkdownTextareaComponent,
    Retro3CheckboxComponent,
    PreviewUploadComponent,
    ReactiveFileComponent,
    TextareaAutoResizeDirective,
    TimestampInputComponent,

    InputSwitchComponent,

    SelectChannelComponent,
    SelectOptionsComponent,
    SelectTagsComponent,
    SelectCheckboxComponent,
    SelectCustomValueComponent,
    SelectLanguagesComponent,
    SelectCategoriesComponent,
    SelectCheckboxAllComponent,

    DynamicFormFieldComponent,

    AdvancedInputFilterComponent
  ],

  providers: [
    FormValidatorService,
    FormReactiveService
  ]
})
export class SharedFormModule { }
