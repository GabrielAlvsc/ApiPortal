const tag_associations = require("./models/tag_associations");

module.exports = (app) => {
  const Categories = app.models.categories;
  const Models = app.models.models;
  const Versions = app.models.versions;
  const Users = app.models.users;
  const Features = app.models.features;
  const Items = app.models.items;
  const Fields = app.models.fields;
  const TypeFields = app.models.type_fields;
  const ResponseFields = app.models.response_fields;
  const ResponseItems = app.models.response_items;
  const CorrectionItems = app.models.correction_items;
  const CorrectionFeatures = app.models.correction_items;
  const ResponseFeatures = app.models.response_features;
  const Books = app.models.books;
  const Equipments = app.models.equipaments;
  const Images = app.models.images;
  const LogPdf = app.models.logPdf;
  const StatusBook = app.models.statusBook;
  const Tickets = app.models.tickets;
  const Tags = app.models.tags;
  const Equipment_tags = app.models.tag_associations;

  //Associação Categoriess
  Models.belongsTo(Categories, { foreignKey: 'category_id' });
  Categories.hasMany(Models, { foreignKey: 'category_id' });

  //Associação Versoes com modelos
  Versions.belongsTo(Models, { foreignKey: 'model_id' });
  Models.hasMany(Versions, { foreignKey: 'model_id' });

  // Associação entre Versions e Users
  Versions.belongsTo(Users, { foreignKey: 'user_responsible_id' });
  Users.hasMany(Versions, { foreignKey: 'user_responsible_id' });

  // Associação entre Features e Versions
  Features.belongsTo(Versions, { foreignKey: 'version_id', as: 'versionDetails' });
  Versions.hasMany(Features, { foreignKey: 'version_id', as: 'versionDetails' });

  // Associação entre Items e Versions
  Items.belongsTo(Versions, { foreignKey: 'version_id', as: 'itemVersion' });
  Versions.hasMany(Items, { foreignKey: 'version_id', as: 'versionItems' });

  // Associação entre Fields e Items
  Fields.belongsTo(Items, { foreignKey: 'item_id' });
  Items.hasMany(Fields, { foreignKey: 'item_id'});

  // Associação entre Fields e type_fields
  Fields.belongsTo(TypeFields, { foreignKey: 'type_field_id', as: 'fieldType' });
  TypeFields.hasMany(Fields, { foreignKey: 'type_field_id', as: 'typeFieldFields' });

  // //Associação entre response_fields e Fields
  ResponseFields.belongsTo(Fields, { foreignKey: 'field_id' })
  Fields.hasMany(ResponseFields, { foreignKey: 'field_id' })

  // //Associação entre response_fields e response_items
  ResponseFields.belongsTo(ResponseItems, { foreignKey: 'response_item_id' })
  ResponseItems.hasMany(ResponseFields, { foreignKey: 'response_item_id' })

  // //Associação entre o correction_items e a response_fields
  CorrectionItems.belongsTo(ResponseItems, { foreignKey: 'response_item_id' })
  ResponseFields.hasMany(CorrectionItems, { foreignKey: 'response_item_id' })

  // //Associação entre o correction_items e a correction_features
  app.models.correction_features.belongsTo(ResponseFeatures, { foreignKey: 'response_feature_id' })
  ResponseFeatures.hasMany(app.models.correction_features, { foreignKey: 'response_feature_id' })


  //Associação entre ResponseItems e book
  ResponseItems.belongsTo(Books, { foreignKey: 'book_id' })
  Books.hasMany(ResponseItems, { foreignKey: 'book_id' })

  //Associação entre response_features e Features
  ResponseFeatures.belongsTo(Features, { foreignKey: 'feature_id' })
  Features.hasMany(ResponseFeatures, { foreignKey: 'feature_id' })

  //Associação entre response_features e book
  ResponseFeatures.belongsTo(Books, { foreignKey: 'book_id' })
  Books.hasMany(ResponseFeatures, { foreignKey: 'book_id' })
  
  ResponseItems.belongsTo(Items, {foreignKey: 'item_id'})
  Items.hasMany(ResponseItems, {foreignKey: 'item_id'})

  //Associação entre book e version
  Books.belongsTo(Versions, { foreignKey: 'version_id' })
  Versions.hasMany(Books, { foreignKey: 'version_id' })

  //Associação entre book e equipament
  Books.belongsTo(Equipments, { foreignKey: 'equipament_id' })
  Equipments.hasMany(Books, { foreignKey: 'equipament_id' })

  //Associação entre book e user_responsible
  Books.belongsTo(Users, { foreignKey: 'user_responsible_id', as: "user_responsible" })
  Users.hasMany(Books, { foreignKey: 'user_responsible_id' })

  //Associação entre book e user_executor
  Books.belongsTo(Users, { foreignKey: 'user_executor_id', as: "user_executor" })
  Users.hasMany(Books, { foreignKey: 'user_executor_id' })

  //Associação entre Images e item
  Images.belongsTo(Items, { foreignKey: 'item_id' })
  Items.hasMany(Images, { foreignKey: 'item_id' })

  // Associação entre Images e Equipments
  Images.belongsTo(Equipments, { foreignKey: 'equipments_id' });
  Equipments.hasMany(Images, { foreignKey: 'equipments_id' });
  
  // Associação de imagens com response_fields
  Images.belongsTo(ResponseFields, { foreignKey: 'response_field_id' });
  ResponseFields.hasMany(Images, { foreignKey: 'response_field_id' });

  //Associação entre Fields e Features
  Fields.belongsTo(Features, { foreignKey: 'feature_id' });
  Features.hasOne(Fields, { foreignKey: 'feature_id' });

  //Associação entre LogPdf e Users
  LogPdf.belongsTo(Users, { foreignKey: 'user_id' });
  Users.hasMany(LogPdf, { foreignKey: 'user_id' });

  //Associação entre StatusBook e Users
  StatusBook.belongsTo(Users, { foreignKey: 'user_id' });
  Users.hasMany(StatusBook, { foreignKey: 'user_id' });

  // um status pertence a um book e um book pode ter varios status
  StatusBook.belongsTo(Books, { foreignKey: 'idBook' });
  Books.hasMany(StatusBook, { foreignKey: 'idBook' });
  
  //Associação entre LogPdf e Models
  LogPdf.belongsTo(Models, { foreignKey: 'model_id' });
  Models.hasMany(LogPdf, { foreignKey: 'model_id' });

  //Associação entre LogPdf e Versions
  LogPdf.belongsTo(Versions, { foreignKey: 'version_id' });
  Versions.hasMany(LogPdf, { foreignKey: 'version_id' });

  //Associação entre LogPdf e Books
  LogPdf.belongsTo(Books, { foreignKey: 'book_id' });
  Books.hasMany(LogPdf, { foreignKey: 'book_id' });

  //Associação entre Tickets e user_responsible
  Tickets.belongsTo(Users, { foreignKey: 'user_responsible', as: "user_resp" });
  //Associação entre Tickes e user_executor
  Tickets.belongsTo(Users, { foreignKey: 'user_requester', as: "user_req"});

  // Tipo de Associação: Isso indica que um usuário pode ter vários tickets associados a ele, 
  // possivelmente representando os tickets que ele executa (executor).
  // Relacionamento Inverso: Esta associação cria um relacionamento inverso, 
  // permitindo que você acesse todos os tickets que um usuário executou. 
  // Por exemplo, você pode acessar user.tickets para obter todos os tickets associados ao usuário.
  Users.hasMany(Tickets, { foreignKey: 'user_responsible', as: 'resposibleFor'})
  Users.hasMany(Tickets, { foreignKey: 'user_requester',as: 'resquestedBy'})

  Equipment_tags.belongsTo(Tags, { foreignKey: 'tag_id', as: 'tag'})
  Tags.hasMany(Equipment_tags, { foreignKey: 'tag_id'})

  Equipment_tags.belongsTo(Equipments, { foreignKey: 'equipment_id', as: 'equipment'})
  Equipments.hasMany(Equipment_tags, { foreignKey: 'equipment_id', as: 'equipment'})

}
