import { AfterContentInit, Component, ContentChildren, forwardRef, Input, QueryList, TemplateRef } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Retro3TemplateDirective } from '@app/shared/shared-main'

@Component({
  selector: 'my-retro3-checkbox',
  styleUrls: [ './retro3-checkbox.component.scss' ],
  templateUrl: './retro3-checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Retro3CheckboxComponent),
      multi: true
    }
  ]
})
export class Retro3CheckboxComponent implements ControlValueAccessor, AfterContentInit {
  @Input() checked = false
  @Input() inputName: string
  @Input() labelText: string
  @Input() labelInnerHTML: string
  @Input() helpPlacement = 'top auto'
  @Input() disabled = false
  @Input() recommended = false

  @ContentChildren(Retro3TemplateDirective) templates: QueryList<Retro3TemplateDirective<'label' | 'help'>>

  labelTemplate: TemplateRef<any>
  helpTemplate: TemplateRef<any>

  ngAfterContentInit () {
    {
      const t = this.templates.find(t => t.name === 'label')
      if (t) this.labelTemplate = t.template
    }

    {
      const t = this.templates.find(t => t.name === 'help')
      if (t) this.helpTemplate = t.template
    }
  }

  propagateChange = (_: any) => { /* empty */ }

  writeValue (checked: boolean) {
    this.checked = checked
  }

  registerOnChange (fn: (_: any) => void) {
    this.propagateChange = fn
  }

  registerOnTouched () {
    // Unused
  }

  onModelChange () {
    this.propagateChange(this.checked)
  }

  setDisabledState (isDisabled: boolean) {
    this.disabled = isDisabled
  }
}
