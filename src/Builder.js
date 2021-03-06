/**
 * Cell Builder singleton that manages the initialization and teardown of cells
 * existing in the application.
 *
 * @type {Object}
 */
export default {
  /**
   * The cells currently active on the page
   * @type {Cell[]}
   */
  activeCells: [],

  /**
   * The cells classes that are registered the the register method
   * @type {Object[]}
   */
  availableCells: {},

  /**
   * Register a new cell class under target name
   * @param  {Cell} cell
   * @param  {String} cellName
   */
  register(cell, name) {
    if (this.availableCells[name]) {
      return;
    }

    this.availableCells[name] = cell;
  },

  /**
   * Do an initial render of the cells available on the page
   */
  initialize() {
    this.reload();
  },

  /**
   * Inititialize new cells, teardown the removed cells and reload existing
   * cells.
   */
  reload() {
    const found = this.findAndBuild();
    const previous = this.activeCells;

    this.activeCells = found;

    found.forEach(cell => {
      if (cell.initialized) {
        cell.reload(cell.element);
      }

      cell.initialized = true;
      cell.initialize && cell.initialize(cell.element);
    });

    this.destroyOrphans(previous, found);
  },

  /**
   * Destroy the orphan cells by inputting the cells currently found on the page
   *
   * @param  {Cell[]} previous Cells that are were previously present on the page
   * @param  {Cell[]} found    Cells that are currently present on the page
   * @return {Cell[]}          Cells that are marked for removal
   */
  destroyOrphans(previous, found) {
    return previous.filter(cell => {
      if (!this.findByElement(cell.element, found)) {
        cell.destroy();

        return true;
      }

      return false;
    });
  },

  /**
   * Find and build or relaod cells currently available on the page
   *
   * @return {Cell[]}
   */
  findAndBuild() {
    return [].map
      .call(document.querySelectorAll("[data-cell]"), element => {
        const cellName = this.getCellName(element);
        const cellConstructor = this.availableCells[cellName];
        const foundCell = this.findByElement(element);

        if (!cellConstructor) {
          console &&
            console.warn &&
            console.warn(`Cell with name ${cellName} not found`);

          return;
        }

        return foundCell || new cellConstructor(element);
      })
      .filter(cell => cell);
  },

  /**
   * Find a cell by its element
   *
   * @param  {HTMLElement} element
   * @param  {[Cells[]]}   [cells=this.activeCells]
   * @return {Cells[]}
   */
  findByElement(element, cells = this.activeCells) {
    return cells.find(cell => cell.element === element);
  },

  getCellName(element) {
    return element.getAttribute("data-cell");
  }
};
