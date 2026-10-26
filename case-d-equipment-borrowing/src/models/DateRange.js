export class DateRange {
  /**
   * @param {string} startDate - Format YYYY-MM-DD
   * @param {string} endDate   - Format YYYY-MM-DD
   */
  constructor(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  isValid() {
    return Boolean(this.startDate && this.endDate && this.startDate <= this.endDate);
  }

  isOverlapping(otherStartDate, otherEndDate) {
    if (!this.isValid() || !otherStartDate || !otherEndDate) return false;
    return this.startDate <= otherEndDate && this.endDate >= otherStartDate;
  }

  formatDisplay() {
    if (!this.isValid()) return '-';
    const [sy, sm, sd] = this.startDate.split('-');
    const [ey, em, ed] = this.endDate.split('-');
    return `${sd}/${sm}/${sy} – ${ed}/${em}/${ey}`;
  }

  formatStart() {
    if (!this.startDate) return '';
    const [y, m, d] = this.startDate.split('-');
    return `${d}/${m}/${y}`;
  }

  formatEnd() {
    if (!this.endDate) return '';
    const [y, m, d] = this.endDate.split('-');
    return `${d}/${m}/${y}`;
  }
}
