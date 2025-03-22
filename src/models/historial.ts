import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "historial",
})
export class Historial extends Model {
  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @Column(DataType.STRING)
  accion!: string;

  @Column(DataType.STRING)
  path!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  foldername!: string;
  
  @Column(DataType.STRING)
  nombrearchivo!: string;
}
